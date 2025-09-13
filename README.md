# Cooking Mama-mia 🍳

**Cooking Mama-mia** est une application web front-end complète conçue pour simplifier la gestion de votre inventaire alimentaire, la planification de vos repas ("meal prep") et l'organisation de votre menu hebdomadaire. Fini le gaspillage et le casse-tête des courses !

Cette application a été développée en HTML5, CSS3 et JavaScript vanilla (ES6+), sans aucune librairie ou framework, pour garantir légèreté et performance.

![Aperçu du Dashboard](https://i.imgur.com/placeholder.png "Image d'aperçu du dashboard")

---

## 🌟 Fonctionnalités Principales

L'application est structurée autour de quatre pages interconnectées :

### 1. 🏠 Dashboard
La page d'accueil qui offre une vue d'ensemble de votre organisation :
- **Menu de la semaine :** Visualisation rapide des repas planifiés pour les 7 prochains jours.
- **Statut des Meal Preps :** Suivi des portions restantes pour chaque plat préparé.
- **Liste de courses intelligente :** Générée automatiquement lorsque des ingrédients manquent pour une recette.
- **Statistiques :** Indicateurs clés sur votre inventaire et vos habitudes.
- **Réinitialisation hebdomadaire :** Le lundi, le menu de la semaine passée est automatiquement archivé et les portions consommées sont déduites.

### 2. 🍽️ Mon Placard
Votre inventaire alimentaire personnel :
- **Ajout facile :** Un formulaire simple et validé pour ajouter de nouveaux ingrédients (nom, quantité, unité).
- **Gestion complète :** Modifiez la quantité ou supprimez des ingrédients en un clic.
- **Persistance des données :** Tout est sauvegardé localement dans votre navigateur grâce au `localStorage`.

### 3. 🍲 Meal Prep
Planifiez et préparez vos plats à l'avance :
- **Création de recettes :** Définissez un nom, le nombre de portions et la liste des ingrédients.
- **Déduction automatique :** Les ingrédients utilisés sont automatiquement déduits de votre "Placard".
- **Gestion de la liste de courses :** Si un ingrédient est manquant ou en quantité insuffisante, il est automatiquement ajouté à votre liste de courses.
- **Modification flexible :** Mettez à jour les recettes et les quantités, et le stock s'ajuste en conséquence.

### 4. 📅 Menu de la Semaine
Organisez vos déjeuners et dîners avec une interface intuitive :
- **Glisser-Déposer (Drag & Drop) :** Faites glisser les étiquettes de vos "meal preps" sur le calendrier de la semaine.
- **Gestion des portions :** Le nombre de portions disponibles pour chaque plat est mis à jour en temps réel.
- **Finalisation :** Un bouton "Fini ?" permet de valider la semaine, de déduire les portions consommées et de préparer le planning pour la semaine suivante.

---

## 🛠️ Stack Technique

- **HTML5 :** Structure sémantique et moderne.
- **CSS3 :** Design responsive (mobile-first), variables CSS pour une maintenance facile, animations et transitions pour une expérience utilisateur fluide.
- **JavaScript (ES6+) :** Logique de l'application entièrement en vanilla JS, organisée en classes (`DashboardManager`, `InventaireManager`, etc.) pour une meilleure modularité.
- **API Navigateur :** Utilisation intensive du `localStorage` et de l'API Drag & Drop native.

---

## 🚀 Lancement

Il n'y a aucune installation requise.

1.  Clonez ou téléchargez ce dépôt.
2.  Ouvrez le fichier `dashboard.html` dans votre navigateur web préféré (Chrome, Firefox, Edge, etc.).
3.  Et voilà ! L'application est prête à être utilisée.

---

## 📂 Structure des Fichiers

```
/
├── assets/
│   └── fond.jpg            # Image de fond
├── dashboard.html          # Page du dashboard
├── dashboard.css           # Styles du dashboard
├── dashboard.js            # Logique du dashboard
├── index.html              # Page "Mon Placard"
├── style.css               # Styles globaux
├── script.js               # Logique de "Mon Placard"
├── mealprep.html           # Page "Meal Prep"
├── mealprep.css            # Styles de "Meal Prep"
├── mealprep.js             # Logique de "Meal Prep"
├── menu.html               # Page "Menu de la Semaine"
├── menu.css                # Styles du menu
├── menu.js                 # Logique du menu
└── README.md               # Ce fichier
``` 