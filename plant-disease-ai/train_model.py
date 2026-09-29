#!/usr/bin/env python3
"""
Plant Disease Classification Model Training Pipeline
=====================================================
Uses Transfer Learning with MobileNetV2 (pretrained on ImageNet) to classify
crop leaf images into 20 plant disease categories across 5 crops.

Features:
- Standard 224x224 input preprocessing
- Data augmentation: Random horizontal flip, rotation, color jitter
- Adam optimizer + Categorical Cross-Entropy Loss
- Learning rate scheduler (ReduceLROnPlateau)
- Model checkpointing & early stopping
- Confusion matrix & classification report generation
- Exports weights (`plant_model.pth` and `class_indices.json`)
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader
    from torchvision import datasets, transforms, models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


def get_data_transforms():
    """Create training and validation data augmentation transforms."""
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])

    return train_transform, eval_transform


def build_mobilenet_v2(num_classes=20, pretrained=True):
    """
    Build MobileNetV2 transfer learning model.
    Freezes initial feature layers and appends custom high-performance classifier head.
    """
    weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v2(weights=weights)

    # Fine-tune: freeze first 10 feature blocks
    for param in list(model.features.parameters())[:12]:
        param.requires_grad = False

    # Replace classifier head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )
    return model


class NestedFolderDataset(torch.utils.data.Dataset):
    """Custom dataset reader supporting nested dataset/<split>/<crop>/<disease> structure."""
    def __init__(self, root_dir, transform=None):
        self.root_dir = Path(root_dir)
        self.transform = transform
        self.samples = []
        self.classes = []

        # Discover all leaf directories
        class_names = []
        for crop_dir in sorted(self.root_dir.iterdir()):
            if crop_dir.is_dir() and not crop_dir.name.startswith('.'):
                for dis_dir in sorted(crop_dir.iterdir()):
                    if dis_dir.is_dir() and not dis_dir.name.startswith('.'):
                        cls_name = f"{crop_dir.name}_{dis_dir.name}"
                        class_names.append(cls_name)

        self.classes = sorted(list(set(class_names)))
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}

        for crop_dir in sorted(self.root_dir.iterdir()):
            if crop_dir.is_dir() and not crop_dir.name.startswith('.'):
                for dis_dir in sorted(crop_dir.iterdir()):
                    if dis_dir.is_dir() and not dis_dir.name.startswith('.'):
                        cls_name = f"{crop_dir.name}_{dis_dir.name}"
                        label_idx = self.class_to_idx[cls_name]
                        for img_path in dis_dir.glob("*.jpg"):
                            self.samples.append((str(img_path), label_idx))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        from PIL import Image
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


def train_pipeline(dataset_dir="dataset", epochs=10, batch_size=32, lr=0.001, output_model="plant_model.pth", pretrained=True):
    """Execute end-to-end model training, validation, and evaluation."""
    if not TORCH_AVAILABLE:
        print("❌ Error: PyTorch is not installed. Please install PyTorch first.")
        sys.exit(1)

    device = torch.device("mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu"))
    print(f"🚀 Training device: {device}")

    train_tf, eval_tf = get_data_transforms()

    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")
    test_dir = os.path.join(dataset_dir, "test")

    print(f"Loading datasets from {dataset_dir}...")
    train_dataset = NestedFolderDataset(train_dir, transform=train_tf)
    val_dataset = NestedFolderDataset(val_dir, transform=eval_tf)
    test_dataset = NestedFolderDataset(test_dir, transform=eval_tf)

    num_classes = len(train_dataset.classes)
    print(f"Loaded {len(train_dataset)} training images across {num_classes} classes.")
    print(f"Loaded {len(val_dataset)} validation images, {len(test_dataset)} test images.")

    # Save class indices
    class_map = {idx: cls_name for idx, cls_name in enumerate(train_dataset.classes)}
    with open("class_indices.json", "w", encoding="utf-8") as f:
        json.dump(class_map, f, indent=2)
    print("✓ Saved class mapping to class_indices.json")

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Build model
    model = build_mobilenet_v2(num_classes=num_classes, pretrained=pretrained)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=lr)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)

    history = {
        "train_loss": [], "train_acc": [],
        "val_loss": [], "val_acc": []
    }

    best_val_acc = 0.0

    print("=" * 65)
    print(f"Starting MobileNetV2 Training ({epochs} epochs, batch size {batch_size})...")
    print("=" * 65)

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        # Training Phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        epoch_train_loss = running_loss / total
        epoch_train_acc = (correct / total) * 100

        # Validation Phase
        model.eval()
        v_running_loss = 0.0
        v_correct = 0
        v_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                v_running_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                v_correct += (preds == labels).sum().item()
                v_total += labels.size(0)

        epoch_val_loss = v_running_loss / v_total
        epoch_val_acc = (v_correct / v_total) * 100
        scheduler.step(epoch_val_loss)
        elapsed = time.time() - t0

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 2))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 2))

        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) | "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.1f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.1f}%")

        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save(model.state_dict(), output_model)
            print(f"  ⭐ Best model checkpoint saved! (Val Acc: {epoch_val_acc:.1f}%)")

    # Final Test Set Evaluation
    print("\nEvaluating best model on independent Test Split...")
    model.load_state_dict(torch.load(output_model, map_location=device))
    model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    test_accuracy = (np.sum(all_preds == all_targets) / len(all_targets)) * 100
    print(f"\n🎯 Overall Test Accuracy: {test_accuracy:.2f}%")

    # Generate Confusion Matrix
    cm = confusion_matrix(all_targets, all_preds)
    fig, ax = plt.subplots(figsize=(12, 10))
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    tick_marks = np.arange(num_classes)
    ax.set_xticks(tick_marks)
    ax.set_xticklabels(train_dataset.classes, rotation=90, fontsize=8)
    ax.set_yticks(tick_marks)
    ax.set_yticklabels(train_dataset.classes, fontsize=8)
    ax.set_xlabel('Predicted Label', fontweight='bold')
    ax.set_ylabel('True Label', fontweight='bold')
    ax.set_title(f'Plant Disease Confusion Matrix (Test Accuracy: {test_accuracy:.1f}%)', fontweight='bold')
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=200)
    plt.close()
    print("✓ Saved Confusion Matrix to confusion_matrix.png")

    # Plot Loss & Accuracy Curves
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    ax1.plot(history["train_loss"], label="Train Loss", color="royalblue", lw=2)
    ax1.plot(history["val_loss"], label="Val Loss", color="crimson", lw=2, linestyle="--")
    ax1.set_title("Categorical Crossentropy Loss")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Loss")
    ax1.grid(True, alpha=0.3)
    ax1.legend()

    ax2.plot(history["train_acc"], label="Train Acc %", color="forestgreen", lw=2)
    ax2.plot(history["val_acc"], label="Val Acc %", color="darkorange", lw=2, linestyle="--")
    ax2.set_title("Model Accuracy (%)")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy %")
    ax2.grid(True, alpha=0.3)
    ax2.legend()

    plt.tight_layout()
    plt.savefig("training_curves.png", dpi=200)
    plt.close()
    print("✓ Saved Learning Curves to training_curves.png")

    # Save training metrics summary
    metrics_summary = {
        "epochs": epochs,
        "batch_size": batch_size,
        "best_val_accuracy": round(best_val_acc, 2),
        "test_accuracy": round(test_accuracy, 2),
        "classes": train_dataset.classes,
        "history": history
    }
    with open("training_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print("✓ Saved training metrics to training_metrics.json")
    print("\n✅ TRAINING PIPELINE COMPLETED SUCCESSFULLY!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Plant Disease Model Trainer")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--dataset", type=str, default="dataset", help="Dataset directory")
    parser.add_argument("--output", type=str, default="plant_model.pth", help="Output model path")
    parser.add_argument("--no-pretrained", action="store_true", help="Train from scratch without downloading ImageNet weights")
    args = parser.parse_args()

    train_pipeline(
        dataset_dir=args.dataset,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        output_model=args.output,
        pretrained=not args.no_pretrained
    )
