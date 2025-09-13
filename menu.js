// Menu de la Semaine - Logique Drag & Drop

class MenuManager {
    constructor() {
        this.mealpreps = [];
        this.planning = {};
        this.jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        this.init();
    }

    init() {
        this.chargerMealpreps();
        this.chargerPlanning();
        this.genererGrilleSemaine();
        this.chargerEtiquettesMealPrep();
        this.afficherPlanning();
        this.setupEventListeners();
    }

    // --- CHARGEMENT & SAUVEGARDE ---

    chargerMealpreps() {
        this.mealpreps = JSON.parse(localStorage.getItem('mealpreps') || '[]');
    }

    chargerPlanning() {
        this.planning = JSON.parse(localStorage.getItem('planningMenu') || '{}');
        // Initialiser si vide
        if (Object.keys(this.planning).length === 0) {
            this.jours.forEach(jour => {
                this.planning[jour] = { dejeuner: null, diner: null };
            });
        }
    }

    sauvegarderPlanning() {
        localStorage.setItem('planningMenu', JSON.stringify(this.planning));
    }

    // --- GÉNÉRATION DE L'INTERFACE ---

    genererGrilleSemaine() {
        const container = document.getElementById('semaine-grid');
        container.innerHTML = '';
        this.jours.forEach(jour => {
            const jourCapitalized = jour.charAt(0).toUpperCase() + jour.slice(1);
            container.innerHTML += `
                <div class="jour-container">
                    <h3 class="jour-titre">${jourCapitalized}</h3>
                    <div class="repas-jour">
                        <div class="repas-slot">
                            <label>Déjeuner</label>
                            <div class="drop-zone" data-jour="${jour}" data-repas="dejeuner"></div>
                        </div>
                        <div class="repas-slot">
                            <label>Dîner</label>
                            <div class="drop-zone" data-jour="${jour}" data-repas="diner"></div>
                        </div>
                    </div>
                </div>`;
        });
    }

    chargerEtiquettesMealPrep() {
        const container = document.getElementById('etiquettes-mealprep');
        const autresContainer = document.getElementById('etiquettes-autres');
        container.innerHTML = ''; // Vider les anciennes étiquettes

        if (this.mealpreps.length === 0) {
            container.innerHTML = `<p class="empty-list-message">Aucun meal prep disponible.</p>`;
            return;
        }

        const portionsUtilisees = this.calculerPortionsUtilisees();

        this.mealpreps.forEach(mp => {
            const utilisees = portionsUtilisees[mp.id] || 0;
            const restantes = mp.portions - utilisees;
            
            const etiquette = document.createElement('div');
            etiquette.className = 'etiquette etiquette-mealprep';
            etiquette.draggable = true;
            etiquette.dataset.type = 'mealprep';
            etiquette.dataset.id = mp.id;
            etiquette.dataset.nom = mp.nom;
            etiquette.dataset.portions = mp.portions;
            etiquette.innerHTML = `🍲 ${mp.nom} <small>(${restantes}/${mp.portions})</small>`;

            if (restantes <= 0) {
                etiquette.classList.add('epuise');
                etiquette.draggable = false;
            }
            container.appendChild(etiquette);
        });
    }

    // --- LOGIQUE DRAG & DROP ---

    setupEventListeners() {
        // Pour les étiquettes
        document.querySelectorAll('.etiquette').forEach(etiquette => {
            etiquette.addEventListener('dragstart', this.handleDragStart.bind(this));
            etiquette.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // Pour les zones de dépôt
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
        });
        
        // Bouton vider
        document.getElementById('btn-vider-planning').addEventListener('click', () => this.viderPlanning(true));
        document.getElementById('btn-finaliser-semaine').addEventListener('click', this.finaliserSemaine.bind(this));
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');
        const data = {
            type: e.target.dataset.type,
            id: e.target.dataset.id,
            nom: e.target.dataset.nom,
            portions: e.target.dataset.portions
        };
        e.dataTransfer.setData('application/json', JSON.stringify(data));
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        const zone = e.target.closest('.drop-zone');
        if (zone && !zone.classList.contains('occupied')) {
            zone.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const zone = e.target.closest('.drop-zone');
        if (zone) zone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const zone = e.target.closest('.drop-zone');
        if (!zone || zone.classList.contains('occupied')) return;
        
        zone.classList.remove('drag-over');
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        
        // Vérifier disponibilité si c'est un meal prep
        if (data.type === 'mealprep') {
            const portionsUtilisees = this.calculerPortionsUtilisees()[data.id] || 0;
            if (portionsUtilisees >= data.portions) {
                alert("Plus de portions disponibles pour ce meal prep !");
                return;
            }
        }
        
        const jour = zone.dataset.jour;
        const repas = zone.dataset.repas;

        this.planning[jour][repas] = data;
        
        this.sauvegarderPlanning();
        this.afficherPlanning();
        this.chargerEtiquettesMealPrep();
        this.setupEventListeners(); // Re-bind listeners
    }
    
    // --- GESTION DU PLANNING ---

    afficherPlanning() {
        this.jours.forEach(jour => {
            ['dejeuner', 'diner'].forEach(repas => {
                const zone = document.querySelector(`.drop-zone[data-jour="${jour}"][data-repas="${repas}"]`);
                const data = this.planning[jour][repas];
                
                zone.innerHTML = '';
                zone.classList.remove('occupied');

                if (data) {
                    zone.classList.add('occupied');
                    zone.innerHTML = `
                        <div class="repas-planifie">
                            <span class="nom-repas">${data.nom}</span>
                            <button class="btn-supprimer" onclick="menu.supprimerRepas('${jour}', '${repas}')">&times;</button>
                        </div>`;
                } else {
                    zone.innerHTML = 'Glissez un repas ici';
                }
            });
        });
    }

    supprimerRepas(jour, repas) {
        this.planning[jour][repas] = null;
        this.sauvegarderPlanning();
        this.afficherPlanning();
        this.chargerEtiquettesMealPrep();
        this.setupEventListeners();
    }

    viderPlanning(withConfirm = true) {
        const confirmation = withConfirm ? confirm("Voulez-vous vraiment vider tout le planning ?") : true;
        
        if(confirmation) {
            this.jours.forEach(jour => {
                this.planning[jour] = { dejeuner: null, diner: null };
            });
            this.sauvegarderPlanning();
            this.afficherPlanning();
            this.chargerEtiquettesMealPrep();
            this.setupEventListeners();
        }
    }

    finaliserSemaine() {
        const portionsUtilisees = this.calculerPortionsUtilisees();

        if (Object.keys(portionsUtilisees).length === 0 && !Object.values(this.planning).some(j => j.dejeuner || j.diner)) {
            alert("Le planning est déjà vide.");
            return;
        }

        if (!confirm("Êtes-vous sûr de vouloir finaliser la semaine ?\n\nLes portions des meal preps utilisés seront définitivement consommées et le planning sera réinitialisé.")) {
            return;
        }

        // 1. Charger la dernière version des meal preps
        const currentMealpreps = JSON.parse(localStorage.getItem('mealpreps') || '[]');

        // 2. Soustraire les portions utilisées
        for (const mealprepId in portionsUtilisees) {
            const mealprep = currentMealpreps.find(mp => mp.id == mealprepId);
            if (mealprep) {
                mealprep.portions -= portionsUtilisees[mealprepId];
            }
        }
        
        // 3. Filtrer pour ne garder que ceux avec des portions restantes
        const updatedMealpreps = currentMealpreps.filter(mp => mp.portions > 0);
        
        // 4. Sauvegarder les meal preps mis à jour
        localStorage.setItem('mealpreps', JSON.stringify(updatedMealpreps));
        
        // 5. Mettre à jour l'état interne et vider le planning
        this.mealpreps = updatedMealpreps;
        this.viderPlanning(false); // Vider sans confirmation

        alert("La semaine est finalisée ! Les portions ont été consommées et le planning a été réinitialisé.");
    }

    calculerPortionsUtilisees() {
        const portionsUtilisees = {};
        this.jours.forEach(jour => {
            ['dejeuner', 'diner'].forEach(repas => {
                const repasPlanifie = this.planning[jour][repas];
                if (repasPlanifie && repasPlanifie.type === 'mealprep') {
                    portionsUtilisees[repasPlanifie.id] = (portionsUtilisees[repasPlanifie.id] || 0) + 1;
                }
            });
        });
        return portionsUtilisees;
    }
}

let menu;
document.addEventListener('DOMContentLoaded', () => {
    menu = new MenuManager();
}); 