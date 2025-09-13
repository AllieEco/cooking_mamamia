// Meal Prep Manager - Logique de gestion des préparations culinaires

class MealPrepManager {
    constructor() {
        this.placard = [];
        this.mealpreps = [];
        this.listeCourses = [];
        this.ingredientsRecetteCourante = [];
        this.editingMealPrepId = null; // Pour suivre l'état d'édition
        this.init();
    }

    init() {
        this.chargerDonneesPlacard();
        this.chargerMealpreps();
        this.chargerListeCourses();
        this.peuplerSelectIngredients();
        this.afficherMealpreps();
        this.setupEventListeners();
    }

    // --- CHARGEMENT & SAUVEGARDE DES DONNÉES ---

    chargerDonneesPlacard() {
        try {
            this.placard = JSON.parse(localStorage.getItem('mon-placard-ingredients') || '[]');
        } catch (e) {
            console.error("Erreur de chargement du placard : ", e);
            this.placard = [];
        }
    }
    
    chargerMealpreps() {
        try {
            this.mealpreps = JSON.parse(localStorage.getItem('mealpreps') || '[]');
        } catch (e) {
            console.error("Erreur de chargement des mealpreps : ", e);
            this.mealpreps = [];
        }
    }

    chargerListeCourses() {
        try {
            this.listeCourses = JSON.parse(localStorage.getItem('listeCourses') || '[]');
        } catch (e) {
            console.error("Erreur de chargement de la liste de courses : ", e);
            this.listeCourses = [];
        }
    }

    sauvegarderPlacard() {
        localStorage.setItem('mon-placard-ingredients', JSON.stringify(this.placard));
    }
    
    sauvegarderMealpreps() {
        localStorage.setItem('mealpreps', JSON.stringify(this.mealpreps));
    }

    sauvegarderListeCourses() {
        localStorage.setItem('listeCourses', JSON.stringify(this.listeCourses));
    }

    // --- GESTION DU FORMULAIRE ---

    setupEventListeners() {
        document.getElementById('form-recette').addEventListener('submit', (e) => this.gererSoumissionRecette(e));
        
        document.getElementById('btn-passer-a-autre').addEventListener('click', () => this.toggleFormIngredient(true));
        document.getElementById('btn-retour-placard').addEventListener('click', () => this.toggleFormIngredient(false));

        document.getElementById('btn-ajouter-ingredient-placard').addEventListener('click', () => this.ajouterIngredientRecette(true));
        document.getElementById('btn-ajouter-autre-ingredient').addEventListener('click', () => this.ajouterIngredientRecette(false));

        document.getElementById('select-ingredient').addEventListener('change', (e) => this.afficherUniteIngredient(e.target.value));
    }

    toggleFormIngredient(versAutre) {
        document.getElementById('form-ingredient-placard').classList.toggle('hidden', versAutre);
        document.getElementById('form-autre-ingredient').classList.toggle('hidden', !versAutre);
    }

    peuplerSelectIngredients() {
        const select = document.getElementById('select-ingredient');
        select.innerHTML = '<option value="">Choisir un ingrédient...</option>';
        this.placard
            .sort((a, b) => a.nom.localeCompare(b.nom))
            .forEach(ing => {
                const option = document.createElement('option');
                option.value = ing.nom;
                option.textContent = `${ing.nom} (dispo: ${ing.quantite} ${ing.unite})`;
                select.appendChild(option);
            });
    }

    afficherUniteIngredient(nomIngredient) {
        const uniteSpan = document.getElementById('unite-affichee');
        const ingredient = this.placard.find(p => p.nom === nomIngredient);
        uniteSpan.textContent = ingredient ? ingredient.unite : '';
    }

    // --- LOGIQUE DE LA RECETTE ---

    ajouterIngredientRecette(depuisPlacard) {
        let nouvelIngredient;

        if (depuisPlacard) {
            const select = document.getElementById('select-ingredient');
            const quantiteInput = document.getElementById('quantite-ingredient-placard');
            const nom = select.value;
            const quantite = parseFloat(quantiteInput.value);

            if (!nom) {
                this.afficherFeedback('Veuillez sélectionner un ingrédient.', 'error'); return;
            }
            if (isNaN(quantite) || quantite <= 0) {
                this.afficherFeedback('Veuillez entrer une quantité valide.', 'error'); return;
            }

            const ingredientPlacard = this.placard.find(p => p.nom === nom);
            nouvelIngredient = { nom: ingredientPlacard.nom, quantite, unite: ingredientPlacard.unite };
            
            select.value = '';
            quantiteInput.value = '';
            document.getElementById('unite-affichee').textContent = '';
        } else {
            const nomInput = document.getElementById('autre-ingredient-nom');
            const quantiteInput = document.getElementById('autre-ingredient-quantite');
            const uniteInput = document.getElementById('autre-ingredient-unite');
            
            const nom = nomInput.value.trim();
            const quantite = parseFloat(quantiteInput.value);
            const unite = uniteInput.value.trim();

            if (!nom || isNaN(quantite) || quantite <= 0 || !unite) {
                this.afficherFeedback('Veuillez remplir tous les champs.', 'error'); return;
            }
            
            if (this.placard.some(p => p.nom.toLowerCase() === nom.toLowerCase())) {
                this.afficherFeedback(`"${nom}" est déjà dans le placard. Utilisez le menu.`, 'warning'); return;
            }

            nouvelIngredient = { nom, quantite, unite };
            
            nomInput.value = '';
            quantiteInput.value = '';
            uniteInput.value = '';
        }

        this.ingredientsRecetteCourante.push(nouvelIngredient);
        this.afficherIngredientsRecette();
    }
    
    supprimerIngredientRecette(index) {
        this.ingredientsRecetteCourante.splice(index, 1);
        this.afficherIngredientsRecette();
    }

    afficherIngredientsRecette() {
        const container = document.getElementById('liste-ingredients-recette');
        container.innerHTML = '';

        if (this.ingredientsRecetteCourante.length === 0) {
            container.innerHTML = `<p class="empty-list-message">Les ingrédients de votre recette apparaîtront ici.</p>`;
            return;
        }
        
        const status = this.verifierDisponibiliteIngredients(this.ingredientsRecetteCourante);

        this.ingredientsRecetteCourante.forEach((ing, index) => {
            const div = document.createElement('div');
            div.className = 'ingredient-item';
            
            let html = `<span>${ing.nom} - ${ing.quantite} ${ing.unite}</span>`;
            
            const estInsuffisant = status.insuffisants.find(i => i.nom === ing.nom);
            const estManquant = !this.placard.some(p => p.nom.toLowerCase() === ing.nom.toLowerCase());

            if (estManquant) {
                div.classList.add('ingredient-manquant'); html += ` <small>(Manquant)</small>`;
            } else if (estInsuffisant) {
                div.classList.add('ingredient-insuffisant'); html += ` <small>(Manque ${estInsuffisant.manquant} ${ing.unite})</small>`;
            } else {
                 div.classList.add('ingredient-disponible');
            }
            
            html += `<button type="button" onclick="mealPrep.supprimerIngredientRecette(${index})">&times;</button>`;
            div.innerHTML = html;
            container.appendChild(div);
        });
    }

    // --- GESTION CRÉATION / MISE À JOUR ---

    gererSoumissionRecette(e) {
        e.preventDefault();
        if (this.editingMealPrepId) {
            this.mettreAJourMealPrep();
        } else {
            this.creerMealPrep();
        }
    }

    creerMealPrep() {
        this.chargerDonneesPlacard(); // TOUJOURS commencer avec les données fraîches

        const nomRecette = document.getElementById('nom-recette').value.trim();
        const nbPortions = parseInt(document.getElementById('nb-portions').value);

        if (!nomRecette || !nbPortions || this.ingredientsRecetteCourante.length === 0) {
            this.showMessage('Veuillez remplir le nom, les portions et ajouter au moins un ingrédient.', 'error');
            return;
        }

        const status = this.verifierDisponibiliteIngredients(this.ingredientsRecetteCourante);
        this.mettreAJourPlacard(this.ingredientsRecetteCourante);
        this.peuplerSelectIngredients(); // Mettre à jour le menu déroulant avec les nouvelles quantités
        
        status.insuffisants.forEach(ing => this.ajouterAListeCourses({nom: ing.nom, quantite: ing.manquant, unite: ing.unite}));
        status.manquants.forEach(ing => this.ajouterAListeCourses(ing));

        const nouveauMealPrep = {
            id: Date.now(), nom: nomRecette, portions: nbPortions,
            ingredients: this.ingredientsRecetteCourante,
            dateCreation: new Date().toISOString().split('T')[0]
        };

        this.mealpreps.push(nouveauMealPrep);
        this.sauvegarderMealpreps();
        this.afficherMealpreps();
        this.resetFormulaire();
        
        let message = `Meal prep "${nomRecette}" créé !`;
        const ajoutsCourses = status.insuffisants.length + status.manquants.length;
        if (ajoutsCourses > 0) message += ` ${ajoutsCourses} ingrédient(s) ajouté(s) à votre liste de courses.`;
        this.showMessage(message, 'success');
    }
    
    mettreAJourMealPrep() {
        this.chargerDonneesPlacard(); // TOUJOURS commencer avec les données fraîches

        const nomRecette = document.getElementById('nom-recette').value.trim();
        const nbPortions = parseInt(document.getElementById('nb-portions').value);
        if (!nomRecette || !nbPortions || this.ingredientsRecetteCourante.length === 0) {
            this.showMessage('Veuillez remplir tous les champs.', 'error'); return;
        }

        const mealPrepOriginal = this.mealpreps.find(m => m.id === this.editingMealPrepId);
        const ingredientsDiff = this.calculerDiffIngredients(mealPrepOriginal.ingredients, this.ingredientsRecetteCourante);
        
        const ingredientsRequis = ingredientsDiff.filter(i => i.diff > 0).map(i => ({nom: i.nom, quantite: i.diff, unite: i.unite}));
        const status = this.verifierDisponibiliteIngredients(ingredientsRequis);
        
        let messageAjouts = '';
        if (status.manquants.length > 0 || status.insuffisants.length > 0) {
            status.manquants.forEach(ing => this.ajouterAListeCourses(ing));
            status.insuffisants.forEach(ing => this.ajouterAListeCourses({nom: ing.nom, quantite: ing.manquant, unite: ing.unite}));
            const ajouts = status.manquants.length + status.insuffisants.length;
            messageAjouts = `${ajouts} ingrédient(s) ajouté(s) à la liste de courses.`;
        }

        this.appliquerDiffAuPlacard(ingredientsDiff);
        this.sauvegarderPlacard(); // Correction: Sauvegarde du placard après l'avoir modifié en mémoire

        const index = this.mealpreps.findIndex(m => m.id === this.editingMealPrepId);
        this.mealpreps[index] = { ...mealPrepOriginal, nom: nomRecette, portions: nbPortions, ingredients: this.ingredientsRecetteCourante };

        this.sauvegarderMealpreps();
        this.peuplerSelectIngredients();
        this.afficherMealpreps();
        this.showMessage(`Meal prep "${nomRecette}" mis à jour ! ${messageAjouts}`, 'success');
        this.annulerEdition();
    }
    
    supprimerMealPrep(id) {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce meal prep ? Les ingrédients ne seront PAS retournés au placard.")) {
            this.mealpreps = this.mealpreps.filter(m => m.id !== id);
            this.sauvegarderMealpreps();
            this.afficherMealpreps();
            this.showMessage('Meal prep supprimé.', 'success');
        }
    }

    // --- LOGIQUE D'ÉDITION ---
    
    commencerEdition(id) {
        const mealPrepAEditer = this.mealpreps.find(m => m.id === id);
        if (!mealPrepAEditer) return;

        this.editingMealPrepId = id;
        document.getElementById('nom-recette').value = mealPrepAEditer.nom;
        document.getElementById('nb-portions').value = mealPrepAEditer.portions;
        this.ingredientsRecetteCourante = JSON.parse(JSON.stringify(mealPrepAEditer.ingredients));
        this.afficherIngredientsRecette();

        document.querySelector('#form-recette .btn-primary').textContent = 'Mettre à jour le meal prep';
        
        let cancelButton = document.getElementById('btn-annuler-edition');
        if (!cancelButton) {
            cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.id = 'btn-annuler-edition';
            cancelButton.textContent = 'Annuler';
            cancelButton.className = 'btn-secondary-outline';
            cancelButton.onclick = () => this.annulerEdition();
            document.querySelector('#form-recette').appendChild(cancelButton);
        }
        
        document.getElementById('form-recette').scrollIntoView({ behavior: 'smooth' });
    }

    annulerEdition() {
        this.editingMealPrepId = null;
        this.resetFormulaire();
    }

    // --- LOGIQUE DE CALCUL & MISE À JOUR PLACARD ---

    calculerDiffIngredients(originaux, nouveaux) {
        const map = new Map();
        originaux.forEach(ing => map.set(ing.nom, { quantite: -ing.quantite, unite: ing.unite }));
        nouveaux.forEach(ing => {
            if (map.has(ing.nom)) map.get(ing.nom).quantite += ing.quantite;
            else map.set(ing.nom, { quantite: ing.quantite, unite: ing.unite });
        });
        const diffArray = [];
        for (const [nom, data] of map.entries()) {
            if (data.quantite !== 0) diffArray.push({ nom, diff: data.quantite, unite: data.unite });
        }
        return diffArray;
    }
    
    appliquerDiffAuPlacard(ingredientsDiff) {
        ingredientsDiff.forEach(diffItem => {
            const indexPlacard = this.placard.findIndex(p => p.nom === diffItem.nom);
            if (indexPlacard > -1) {
                this.placard[indexPlacard].quantite -= diffItem.diff;
                if (this.placard[indexPlacard].quantite <= 0) this.placard.splice(indexPlacard, 1);
            } else if (diffItem.diff < 0) {
                this.placard.push({ id: Date.now(), nom: diffItem.nom, quantite: -diffItem.diff, unite: diffItem.unite });
            }
        });
    }
    
    mettreAJourPlacard(ingredientsUtilises) {
        // Cette fonction ne sert que pour la création initiale
        this.appliquerDiffAuPlacard(ingredientsUtilises.map(ing => ({...ing, diff: ing.quantite})));
        this.sauvegarderPlacard(); // Correction: Sauvegarde du placard après l'avoir modifié en mémoire
    }

    verifierDisponibiliteIngredients(ingredientsRecette) {
        const manquants = [], insuffisants = [];
        ingredientsRecette.forEach(ingRecette => {
            const ingPlacard = this.placard.find(p => p.nom.toLowerCase() === ingRecette.nom.toLowerCase());
            if (!ingPlacard) {
                manquants.push(ingRecette);
            } else if (ingPlacard.quantite < ingRecette.quantite) {
                insuffisants.push({ ...ingRecette, disponible: ingPlacard.quantite, manquant: ingRecette.quantite - ingPlacard.quantite });
            }
        });
        return { manquants, insuffisants };
    }

    // --- LISTE DE COURSES ---

    ajouterAListeCourses(ingredient) {
        const indexCourses = this.listeCourses.findIndex(c => c.nom === ingredient.nom && c.unite === ingredient.unite);
        if (indexCourses > -1) {
            this.listeCourses[indexCourses].quantite += ingredient.quantite;
        } else {
            this.listeCourses.push({ ...ingredient, origine: 'meal-prep', dateAjout: new Date().toISOString().split('T')[0] });
        }
        this.sauvegarderListeCourses();
    }

    // --- AFFICHAGE ---

    afficherMealpreps() {
        const container = document.getElementById('liste-mealpreps');
        const emptyState = document.getElementById('empty-state-mealprep');
        container.innerHTML = '';
        
        if (this.mealpreps.length === 0) {
            emptyState.style.display = 'block'; return;
        }
        emptyState.style.display = 'none';

        this.mealpreps.forEach(meal => {
            const card = document.createElement('div');
            card.className = 'mealprep-card';
            card.innerHTML = `
                <div class="mealprep-header">
                    <h3>${meal.nom}</h3>
                    <div class="actions">
                         <button class="btn-editer" onclick="mealPrep.commencerEdition(${meal.id})">✏️</button>
                         <button class="btn-supprimer" onclick="mealPrep.supprimerMealPrep(${meal.id})">&times;</button>
                    </div>
                </div>
                <div class="ingredients-list">
                    ${meal.ingredients.map(ing => `
                        <div class="ingredient-item"><span>${ing.nom} - ${ing.quantite} ${ing.unite}</span></div>
                    `).join('')}
                </div>
                <div class="date-creation">Créé le ${new Date(meal.dateCreation).toLocaleDateString('fr-FR')}</div>
            `;
            container.appendChild(card);
        });
    }

    showMessage(text, type = 'info') {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        setTimeout(() => messageDiv.classList.add('hidden'), 4000);
    }
    
    afficherFeedback(text, type = 'info') {
        const feedbackDiv = document.getElementById('ingredient-feedback');
        feedbackDiv.textContent = text;
        feedbackDiv.className = `feedback-message ${type}`;
        feedbackDiv.classList.remove('hidden');
        setTimeout(() => feedbackDiv.classList.add('hidden'), 3000);
    }
    
    resetFormulaire() {
        document.getElementById('form-recette').reset();
        this.ingredientsRecetteCourante = [];
        this.afficherIngredientsRecette();
        this.editingMealPrepId = null;
        document.querySelector('#form-recette .btn-primary').textContent = 'Créer le meal prep';
        document.getElementById('btn-annuler-edition')?.remove();
    }
}

let mealPrep;
document.addEventListener('DOMContentLoaded', () => {
    mealPrep = new MealPrepManager();
}); 