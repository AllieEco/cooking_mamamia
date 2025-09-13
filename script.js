// Application de gestion d'inventaire alimentaire - Mon Placard
// JavaScript vanilla ES6+ avec localStorage

class InventaireManager {
    constructor() {
        this.ingredients = [];
        this.unitesAutorisees = ['grammes', 'kg', 'pieces', 'litres', 'mL', 'cL'];
        this.init();
    }

    // Initialisation de l'application
    init() {
        this.chargerDonnees();
        this.afficherIngredients();
        this.setupEventListeners();
        this.setupValidation();
    }

    // Gestion des événements
    setupEventListeners() {
        // Formulaire d'ajout
        const formAjout = document.getElementById('form-ajout');
        formAjout.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validation en temps réel
        const inputs = formAjout.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Validation des champs
    setupValidation() {
        const nomInput = document.getElementById('nom-ingredient');

        // Validation du nom (pas de doublons)
        nomInput.addEventListener('input', () => {
            const nom = nomInput.value.trim().toLowerCase();
            const existe = this.ingredients.some(ing => 
                ing.nom.toLowerCase() === nom
            );
            
            if (existe && nom.length > 0) {
                this.showFieldError(nomInput, 'Cet ingrédient existe déjà');
            } else {
                this.clearFieldError(nomInput);
            }
        });
    }

    // Gestion de la soumission du formulaire
    handleSubmit(e) {
        e.preventDefault();
        
        const nom = document.getElementById('nom-ingredient').value.trim();
        const quantite = parseFloat(document.getElementById('quantite').value);
        const unite = document.getElementById('unite').value;

        // Validation complète
        if (!this.validateForm(nom, quantite, unite)) {
            return;
        }

        // Ajout de l'ingrédient
        this.ajouterIngredient(nom, quantite, unite);
        
        // Reset du formulaire
        this.resetForm();
    }

    // Validation du formulaire
    validateForm(nom, quantite, unite) {
        let isValid = true;

        // Validation du nom
        if (!nom || nom.length === 0) {
            this.showFieldError(document.getElementById('nom-ingredient'), 'Le nom est requis');
            isValid = false;
        } else if (this.ingredients.some(ing => ing.nom.toLowerCase() === nom.toLowerCase())) {
            this.showFieldError(document.getElementById('nom-ingredient'), 'Cet ingrédient existe déjà');
            isValid = false;
        }

        // Validation de la quantité
        if (!quantite || quantite <= 0) {
            this.showFieldError(document.getElementById('quantite'), 'La quantité doit être supérieure à 0');
            isValid = false;
        }

        // Validation de l'unité
        if (!unite || !this.unitesAutorisees.includes(unite)) {
            this.showFieldError(document.getElementById('unite'), 'Veuillez sélectionner une unité');
            isValid = false;
        }

        return isValid;
    }

    // Validation d'un champ individuel
    validateField(field) {
        const value = field.value.trim();
        
        switch (field.id) {
            case 'nom-ingredient':
                if (!value) {
                    this.showFieldError(field, 'Le nom est requis');
                }
                break;
            case 'quantite':
                const quantite = parseFloat(value);
                if (!quantite || quantite <= 0) {
                    this.showFieldError(field, 'La quantité doit être supérieure à 0');
                }
                break;
            case 'unite':
                if (!value) {
                    this.showFieldError(field, 'Veuillez sélectionner une unité');
                }
                break;
        }
    }

    // Affichage d'erreur sur un champ
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = 'var(--error-color)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--error-color)';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }

    // Suppression d'erreur sur un champ
    clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Ajout d'un ingrédient
    ajouterIngredient(nom, quantite, unite) {
        const nouvelIngredient = {
            id: Date.now(),
            nom: nom,
            quantite: quantite,
            unite: unite,
            dateAjout: new Date().toISOString()
        };

        this.ingredients.push(nouvelIngredient);
        this.sauvegarderDonnees();
        this.afficherIngredients();
        this.showMessage('Ingrédient ajouté avec succès !', 'success');
    }

    // Affichage des ingrédients
    afficherIngredients() {
        const container = document.getElementById('liste-ingredients');
        const emptyState = document.getElementById('empty-state');
        
        // Vider le conteneur
        container.innerHTML = '';

        if (this.ingredients.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Trier par nom
        const ingredientsTries = [...this.ingredients].sort((a, b) => 
            a.nom.localeCompare(b.nom, 'fr')
        );

        // Créer les cartes d'ingrédients
        ingredientsTries.forEach(ingredient => {
            const card = this.creerCarteIngredient(ingredient);
            container.appendChild(card);
        });
    }

    // Création d'une carte d'ingrédient
    creerCarteIngredient(ingredient) {
        const card = document.createElement('div');
        card.className = 'ingredient-card';
        card.dataset.id = ingredient.id;

        card.innerHTML = '<div class="ingredient-info">' +
            '<div class="ingredient-details">' +
                '<h3>' + this.escapeHtml(ingredient.nom) + '</h3>' +
                '<p>' + ingredient.quantite + ' ' + ingredient.unite + '</p>' +
            '</div>' +
            '<div class="ingredient-actions">' +
                '<button class="btn-secondary" onclick="inventaire.modifierIngredient(' + ingredient.id + ')">' +
                    'Modifier' +
                '</button>' +
                '<button class="btn-danger" onclick="inventaire.supprimerIngredient(' + ingredient.id + ')">' +
                    'Supprimer' +
                '</button>' +
            '</div>' +
        '</div>';

        return card;
    }

    // Modification d'un ingrédient
    modifierIngredient(id) {
        const ingredient = this.ingredients.find(ing => ing.id === id);
        if (!ingredient) return;

        const card = document.querySelector('[data-id="' + id + '"]');
        card.classList.add('editing');

        let optionsHtml = '';
        this.unitesAutorisees.forEach(unite => {
            const selected = unite === ingredient.unite ? 'selected' : '';
            optionsHtml += '<option value="' + unite + '" ' + selected + '>' + unite + '</option>';
        });

        card.innerHTML = '<form class="ingredient-form" onsubmit="inventaire.validerModification(event, ' + id + ')">' +
            '<div class="form-row">' +
                '<div class="input-group">' +
                    '<label>Nom</label>' +
                    '<input type="text" value="' + this.escapeHtml(ingredient.nom) + '" name="nom" required>' +
                '</div>' +
                '<div class="input-group">' +
                    '<label>Quantité</label>' +
                    '<input type="number" value="' + ingredient.quantite + '" name="quantite" min="0.1" step="0.1" required>' +
                '</div>' +
                '<div class="input-group">' +
                    '<label>Unité</label>' +
                    '<select name="unite" required>' + optionsHtml + '</select>' +
                '</div>' +
            '</div>' +
            '<div class="form-actions">' +
                '<button type="button" class="btn-secondary" onclick="inventaire.annulerModification(' + id + ')">' +
                    'Annuler' +
                '</button>' +
                '<button type="submit" class="btn-success">' +
                    'Valider' +
                '</button>' +
            '</div>' +
        '</form>';
    }

    // Validation de la modification
    validerModification(e, id) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const nom = formData.get('nom').trim();
        const quantite = parseFloat(formData.get('quantite'));
        const unite = formData.get('unite');

        // Validation
        if (!nom || nom.length === 0) {
            this.showMessage('Le nom est requis', 'error');
            return;
        }

        if (!quantite || quantite <= 0) {
            this.showMessage('La quantité doit être supérieure à 0', 'error');
            return;
        }

        if (!this.unitesAutorisees.includes(unite)) {
            this.showMessage('Unité invalide', 'error');
            return;
        }

        // Vérifier l'unicité du nom (sauf pour l'ingrédient en cours de modification)
        const nomExiste = this.ingredients.some(ing => 
            ing.id !== id && ing.nom.toLowerCase() === nom.toLowerCase()
        );

        if (nomExiste) {
            this.showMessage('Cet ingrédient existe déjà', 'error');
            return;
        }

        // Mise à jour
        const ingredient = this.ingredients.find(ing => ing.id === id);
        if (ingredient) {
            ingredient.nom = nom;
            ingredient.quantite = quantite;
            ingredient.unite = unite;
            
            this.sauvegarderDonnees();
            this.afficherIngredients();
            this.showMessage('Ingrédient modifié avec succès !', 'success');
        }
    }

    // Annulation de la modification
    annulerModification(id) {
        this.afficherIngredients();
    }

    // Suppression d'un ingrédient
    supprimerIngredient(id) {
        const ingredient = this.ingredients.find(ing => ing.id === id);
        if (!ingredient) return;

        const confirmation = confirm('Supprimer "' + ingredient.nom + '" définitivement ?');
        if (!confirmation) return;

        this.ingredients = this.ingredients.filter(ing => ing.id !== id);
        this.sauvegarderDonnees();
        this.afficherIngredients();
        this.showMessage('Ingrédient supprimé avec succès !', 'success');
    }

    // Sauvegarde des données
    sauvegarderDonnees() {
        try {
            localStorage.setItem('mon-placard-ingredients', JSON.stringify(this.ingredients));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showMessage('Erreur lors de la sauvegarde des données', 'error');
        }
    }

    // Chargement des données
    chargerDonnees() {
        try {
            const donnees = localStorage.getItem('mon-placard-ingredients');
            if (donnees) {
                this.ingredients = JSON.parse(donnees);
                
                // Validation des données chargées
                this.ingredients = this.ingredients.filter(ing => 
                    ing.id && ing.nom && ing.quantite > 0 && this.unitesAutorisees.includes(ing.unite)
                );
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.ingredients = [];
            this.showMessage('Erreur lors du chargement des données', 'error');
        }
    }

    // Affichage des messages
    showMessage(text, type = 'info') {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        messageDiv.classList.remove('hidden');

        // Auto-masquage après 3 secondes
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
    }

    // Reset du formulaire
    resetForm() {
        document.getElementById('form-ajout').reset();
        
        // Nettoyer les erreurs
        const inputs = document.querySelectorAll('#form-ajout input, #form-ajout select');
        inputs.forEach(input => this.clearFieldError(input));
    }

    // Échappement HTML pour la sécurité
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Méthodes utilitaires
    getIngredients() {
        return [...this.ingredients];
    }

    getIngredientById(id) {
        return this.ingredients.find(ing => ing.id === id);
    }
}

// Initialisation de l'application
let inventaire;

document.addEventListener('DOMContentLoaded', function() {
    inventaire = new InventaireManager();
    
    // Ajouter des données d'exemple si l'inventaire est vide
    if (inventaire.getIngredients().length === 0) {
        console.log('Inventaire vide - prêt pour l\'ajout d\'ingrédients');
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Gestion des erreurs de promesses non capturées
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesse rejetée:', e.reason);
});
