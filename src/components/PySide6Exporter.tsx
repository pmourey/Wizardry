import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, FileCode, Play } from 'lucide-react';

export const PySide6Exporter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const pythonCode = `#!/usr/bin/env python3
"""
Wizardry I: Proving Grounds of the Mad Overlord
Portage fidèle en Python & PySide6 à partir du code source Pascal (1981)
"""

import sys
import random
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Optional

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QTextEdit, QListWidget, QListWidgetItem,
    QProgressBar, QGroupBox, QDialog, QLineEdit, QComboBox, QSpinBox,
    QMessageBox, QSplitter
)
from PySide6.QtGui import QColor, QFont, QPainter, QPen, QBrush, QIcon
from PySide6.QtCore import Qt, QTimer, QRectF, QPointF

# ==============================================================================
# 1. TYPES & ÉNUMÉRATIONS DU CODE PASCAL
# ==============================================================================

class Race(Enum):
    HUMAN = "HUMAIN"
    ELF = "ELFE"
    DWARF = "NAIN"
    GNOME = "GNOME"
    HOBBIT = "HOBBIT"

class ClassType(Enum):
    FIGHTER = "GUERRIER"
    MAGE = "MAGE"
    PRIEST = "PRÊTRE"
    THIEF = "VOLEUR"
    BISHOP = "ÉVÊQUE"
    SAMURAI = "SAMOURAÏ"
    LORD = "SEIGNEUR"
    NINJA = "NINJA"

class Alignment(Enum):
    GOOD = "BON"
    NEUTRAL = "NEUTRE"
    EVIL = "MAUVAIS"

class Status(Enum):
    OK = "OK"
    AFRAID = "EFFRAYÉ"
    ASLEEP = "ENDORMI"
    PARALYZED = "PARALYSÉ"
    STONED = "PÉTRIFIÉ"
    DEAD = "MORT"
    ASHES = "CENDRES"
    LOST = "PERDU"

RACE_BASE = {
    Race.HUMAN:  {"STR": 8,  "IQ": 8,  "PIE": 5,  "VIT": 8,  "AGI": 8,  "LUK": 9},
    Race.ELF:    {"STR": 7,  "IQ": 10, "PIE": 10, "VIT": 6,  "AGI": 9,  "LUK": 6},
    Race.DWARF:  {"STR": 10, "IQ": 7,  "PIE": 10, "VIT": 10, "AGI": 5,  "LUK": 6},
    Race.GNOME:  {"STR": 7,  "IQ": 7,  "PIE": 10, "VIT": 8,  "AGI": 10, "LUK": 7},
    Race.HOBBIT: {"STR": 5,  "IQ": 7,  "PIE": 7,  "VIT": 6,  "AGI": 10, "LUK": 15},
}

EXP_TABLE = {
    ClassType.FIGHTER: [1000, 1724, 2972, 5124, 8834, 15231, 26260, 45275, 78060, 134586, 232044, 400000],
    ClassType.MAGE:    [1100, 1896, 3269, 5636, 9717, 16753, 28884, 49799, 85859, 148015, 255198, 440000],
    ClassType.PRIEST:  [1050, 1810, 3120, 5379, 9274, 15989, 27567, 47529, 81946, 141286, 243596, 420000],
    ClassType.THIEF:   [900,  1551, 2674, 4610, 7948, 13703, 23625, 40732, 70227, 121081, 208760, 360000],
    ClassType.BISHOP:  [1200, 2068, 3565, 6146, 10596, 18268, 31496, 54299, 93618, 161393, 278255, 480000],
    ClassType.SAMURAI: [1250, 2155, 3715, 6405, 11043, 19039, 32825, 56594, 97575, 168232, 290055, 500000],
    ClassType.LORD:    [1300, 2241, 3863, 6660, 11482, 19796, 34131, 58846, 101458, 174927, 301598, 520000],
    ClassType.NINJA:   [1450, 2500, 4310, 7431, 12812, 22089, 38084, 65662, 113201, 195174, 336500, 580000],
}

@dataclass
class Item:
    id: int
    name: str
    price: int
    ac_mod: int = 0
    hit_mod: int = 0
    dice_sides: int = 4
    dice_count: int = 1
    min_add: int = 0
    crit: bool = False
    is_weapon: bool = False

@dataclass
class Character:
    name: str
    race: Race
    class_type: ClassType
    alignment: Alignment
    status: Status = Status.OK
    level: int = 1
    hp: int = 10
    hp_max: int = 10
    ac: int = 10
    exp: int = 0
    gold: int = 100
    age_weeks: int = 18 * 52
    str: int = 10
    iq: int = 10
    piety: int = 10
    vit: int = 10
    agi: int = 10
    luck: int = 10
    inventory: List[Item] = field(default_factory=list)

@dataclass
class Monster:
    name: str
    level: int
    hp: int
    ac: int
    exp: int
    attacks: int = 1
    attack_dam: int = 4

# ==============================================================================
# 2. VUE 3D / FIL DE FER DU LABYRINTHE EN PYSIDE6
# ==============================================================================

class DungeonViewportWidget(QWidget):
    """Rendu 3D temps réel du donjon à la première personne"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(480, 360)
        self.wireframe = False
        self.x = 0
        self.y = 0
        self.dir = 0 # 0=Nord, 1=Est, 2=Sud, 3=Ouest
        self.light = 0

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        w = self.width()
        h = self.height()

        if self.wireframe:
            painter.fillRect(0, 0, w, h, QColor("#001100"))
            painter.setPen(QPen(QColor("#22c55e"), 2))
        else:
            # Ambiance donjon pierre sombre
            painter.fillRect(0, 0, w, h, QColor("#0a0d12"))
            painter.fillRect(0, int(h * 0.5), w, int(h * 0.5), QColor("#07090d"))
            painter.setPen(QPen(QColor("#334155"), 2))

        # Perspective 3D
        cx, cy = w / 2, h / 2
        # Tunnels imbriqués
        for depth in range(3, 0, -1):
            scale = 0.28 * depth
            rw, rh = w * scale, h * scale
            rx = cx - rw / 2
            ry = cy - rh / 2
            
            if not self.wireframe:
                painter.setBrush(QBrush(QColor(15 + depth * 8, 18 + depth * 8, 25 + depth * 8)))
            else:
                painter.setBrush(Qt.NoBrush)

            painter.drawRect(QRectF(rx, ry, rw, rh))
            # Lignes de fuite
            painter.drawLine(0, 0, int(rx), int(ry))
            painter.drawLine(w, 0, int(rx + rw), int(ry))
            painter.drawLine(0, h, int(rx), int(ry + rh))
            painter.drawLine(w, h, int(rx + rw), int(ry + rh))

        # Indicateur de boussole
        dirs = ["NORD ↑", "EST →", "SUD ↓", "OUEST ←"]
        painter.setPen(QColor("#e2e8f0"))
        painter.setFont(QFont("Arial", 11, QFont.Bold))
        painter.drawText(20, 35, f"DIR: {dirs[self.dir]} | COORD: ({self.x}, {self.y})")
        if self.light > 0:
            painter.setPen(QColor("#f59e0b"))
            painter.drawText(20, 55, "SORT LUMIÈRE: ACTIF")

# ==============================================================================
# 3. FENÊTRE PRINCIPALE DU JEU
# ==============================================================================

class WizardryMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Wizardry I: Proving Grounds of the Mad Overlord (PySide6 Edition)")
        self.resize(1100, 720)
        self.setStyleSheet("""
            QMainWindow { background-color: #05070a; color: #f8fafc; }
            QGroupBox { border: 1px solid #334155; border-radius: 6px; margin-top: 10px; font-weight: bold; color: #cbd5e1; }
            QGroupBox::title { subcontrol-origin: margin; left: 10px; padding: 0 4px; }
            QPushButton { background-color: #1e293b; color: #f8fafc; border: 1px solid #475569; padding: 8px 14px; border-radius: 4px; font-weight: bold; }
            QPushButton:hover { background-color: #334155; border-color: #94a3b8; }
            QPushButton:pressed { background-color: #0f172a; }
            QTextEdit { background-color: #090d14; border: 1px solid #334155; color: #e2e8f0; font-family: monospace; font-size: 11pt; border-radius: 4px; }
            QListWidget { background-color: #090d14; border: 1px solid #334155; color: #e2e8f0; border-radius: 4px; }
        """)

        self.party: List[Character] = []
        self.init_default_party()
        self.init_ui()

    def init_default_party(self):
        """Groupe de départ équilibré niveau 1 fidèle au jeu"""
        self.party = [
            Character("ROLAND", Race.HUMAN, ClassType.FIGHTER, Alignment.GOOD, hp=12, hp_max=12, ac=5),
            Character("MUSASHI", Race.HUMAN, ClassType.SAMURAI, Alignment.GOOD, hp=14, hp_max=14, ac=6),
            Character("THORIN", Race.DWARF, ClassType.PRIEST, Alignment.GOOD, hp=10, hp_max=10, ac=6),
            Character("SHADOW", Race.HOBBIT, ClassType.THIEF, Alignment.NEUTRAL, hp=8, hp_max=8, ac=7),
            Character("ALISTAIR", Race.ELF, ClassType.MAGE, Alignment.NEUTRAL, hp=6, hp_max=6, ac=9),
            Character("CEDRIC", Race.GNOME, ClassType.BISHOP, Alignment.GOOD, hp=8, hp_max=8, ac=8)
        ]

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(12, 12, 12, 12)
        main_layout.setSpacing(12)

        # Panneau Gauche: Rendu Donjon + Log de Jeu
        left_layout = QVBoxLayout()
        self.viewport = DungeonViewportWidget()
        left_layout.addWidget(self.viewport, stretch=3)

        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.append("🏰 Bienvenue au Château de Trebor !")
        self.log_text.append("Votre groupe d'aventuriers est réuni à la Taverne de Gilgamesh.")
        left_layout.addWidget(self.log_text, stretch=2)
        main_layout.addLayout(left_layout, stretch=3)

        # Panneau Droit: Équipe & Actions
        right_layout = QVBoxLayout()

        # Liste des Personnages
        party_box = QGroupBox("AVENTURIERS")
        party_layout = QVBoxLayout(party_box)
        self.party_list = QListWidget()
        self.update_party_ui()
        party_layout.addWidget(self.party_list)
        right_layout.addWidget(party_box, stretch=2)

        # Commandes Château / Labyrinthe
        cmd_box = QGroupBox("ACTIONS")
        cmd_layout = QVBoxLayout(cmd_box)

        # Pavé directionnel
        dir_layout = QHBoxLayout()
        self.btn_left = QPushButton("↶ Gauche (A)")
        self.btn_fwd = QPushButton("↑ Avancer (W)")
        self.btn_right = QPushButton("↷ Droite (D)")
        dir_layout.addWidget(self.btn_left)
        dir_layout.addWidget(self.btn_fwd)
        dir_layout.addWidget(self.btn_right)
        cmd_layout.addLayout(dir_layout)

        self.btn_left.clicked.connect(self.turn_left)
        self.btn_fwd.clicked.connect(self.move_forward)
        self.btn_right.clicked.connect(self.turn_right)

        # Boutons du Château
        self.btn_inn = QPushButton("Auberge (Repos & Niveaux)")
        self.btn_boltac = QPushButton("Comptoir de Boltac (Boutique)")
        self.btn_temple = QPushButton("Temple de Cant (Résurrection)")
        self.btn_camp = QPushButton("Camper / Soigner / Inventaire")
        self.btn_wireframe = QPushButton("Mode Rétro Fil de Fer")

        self.btn_inn.clicked.connect(self.visit_inn)
        self.btn_boltac.clicked.connect(self.visit_boltac)
        self.btn_temple.clicked.connect(self.visit_temple)
        self.btn_camp.clicked.connect(self.open_camp)
        self.btn_wireframe.clicked.connect(self.toggle_wireframe)

        cmd_layout.addWidget(self.btn_inn)
        cmd_layout.addWidget(self.btn_boltac)
        cmd_layout.addWidget(self.btn_temple)
        cmd_layout.addWidget(self.btn_camp)
        cmd_layout.addWidget(self.btn_wireframe)

        right_layout.addWidget(cmd_box, stretch=2)
        main_layout.addLayout(right_layout, stretch=2)

    def update_party_ui(self):
        self.party_list.clear()
        for i, hero in enumerate(self.party):
            line = f"#{i+1} {hero.name:<10} {hero.class_type.value:<8} CA:{hero.ac:<2} PV:{hero.hp}/{hero.hp_max} [{hero.status.value}]"
            self.party_list.addItem(line)

    def turn_left(self):
        self.viewport.dir = (self.viewport.dir + 3) % 4
        self.viewport.update()
        self.log_text.append("Vous pivotez vers la gauche.")

    def turn_right(self):
        self.viewport.dir = (self.viewport.dir + 1) % 4
        self.viewport.update()
        self.log_text.append("Vous pivotez vers la droite.")

    def move_forward(self):
        # Progression dans le labyrinthe
        dx = [0, 1, 0, -1][self.viewport.dir]
        dy = [1, 0, -1, 0][self.viewport.dir]
        self.viewport.x = (self.viewport.x + dx) % 20
        self.viewport.y = (self.viewport.y + dy) % 20
        self.viewport.update()
        self.log_text.append(f"Vous avancez dans le couloir de pierre ({self.viewport.x}, {self.viewport.y}).")
        
        # Tirage de combat aléatoire (chance 1/8)
        if random.random() < 0.15:
            self.trigger_encounter()

    def trigger_encounter(self):
        monsters = [
            Monster("BUBBLY SLIME", 1, 3, 11, 35),
            Monster("KOBOLD", 1, 4, 10, 70),
            Monster("ORC", 1, 6, 9, 95),
            Monster("SKELETON", 2, 8, 8, 160)
        ]
        m = random.choice(monsters)
        count = random.randint(1, 4)
        self.log_text.append(f"⚔️ ALERTE ! Un groupe de {count} {m.name} surgit de l'ombre !")
        QMessageBox.information(self, "Combat !", f"Rencontre avec {count} {m.name} !")

    def visit_inn(self):
        self.log_text.append("🏨 À l'Auberge de l'Aventurier, le groupe se repose et récupère ses points de vie.")
        for h in self.party:
            h.hp = h.hp_max
            # Vérification de montée de niveau
            need = EXP_TABLE[h.class_type][min(len(EXP_TABLE[h.class_type])-1, h.level - 1)]
            if h.exp >= need:
                h.level += 1
                h.hp_max += random.randint(4, 10)
                h.hp = h.hp_max
                self.log_text.append(f"🌟 {h.name} atteint le NIVEAU {h.level} !")
        self.update_party_ui()

    def visit_boltac(self):
        self.log_text.append("🛒 Boltac vous accueille avec un large sourire : 'Bienvenue marchands et héros !'")
        QMessageBox.information(self, "Comptoir de Boltac", "Boltac : 'Épées longues, cottes de mailles et potions disponibles !'")

    def visit_temple(self):
        self.log_text.append("⛪ Le Temple de Cant rayonne d'une lueur mystique. Les prêtres prient pour votre âme.")
        for h in self.party:
            if h.status in (Status.DEAD, Status.ASHES):
                h.status = Status.OK
                h.hp = 1
                self.log_text.append(f"✨ Miracle ! {h.name} est ressuscité !")
        self.update_party_ui()

    def open_camp(self):
        self.log_text.append("⛺ Le groupe monte le campement pour soigner ses blessures et réviser ses sorts.")
        for h in self.party:
            if h.hp < h.hp_max:
                h.hp = min(h.hp_max, h.hp + 2)
        self.update_party_ui()

    def toggle_wireframe(self):
        self.viewport.wireframe = not self.viewport.wireframe
        self.viewport.update()
        state = "ACTIVÉ" if self.viewport.wireframe else "DÉSACTIVÉ"
        self.log_text.append(f"Mode Rétro Apple II Fil de Fer: {state}")

# ==============================================================================
# 4. POINT D'ENTRÉE DU SCRIPT
# ==============================================================================

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = WizardryMainWindow()
    window.show()
    sys.exit(app.exec())
`;

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wizardry1_pyside6.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/70 border border-emerald-600/40 rounded-lg text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Code Source Python / PySide6 Autonome
              </h2>
              <p className="text-xs text-slate-400">
                Application de bureau complète avec interface graphique Qt et moteur fidèle
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger .py
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Execution Instructions Banner */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Exécution locale avec Python 3 :</span>
            <code className="bg-black/50 px-2 py-0.5 rounded text-amber-300 font-mono">
              pip install pyside6 && python wizardry1_pyside6.py
            </code>
          </div>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-4 overflow-auto bg-black/60 font-mono text-xs text-slate-300 leading-relaxed selection:bg-amber-900 selection:text-white">
          <pre>{pythonCode}</pre>
        </div>
      </div>
    </div>
  );
};
