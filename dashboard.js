// Dashboard - Centre de contrôle de l'application

class DashboardManager {
    constructor() {
        this.donnees = {};
        this.init();
    }

    init() {
        this.mettreAJourDashboard();
        this.setupEventListeners();
    }

    chargerToutesLesDonnees() {
        const ingredients = JSON.parse(localStorage.getItem('mon-placard-ingredients') || '[]');
        const mealpreps = JSON.parse(localStorage.getItem('mealpreps') || '[]');
        const planningMenu = JSON.parse(localStorage.getItem('planningMenu') || '{}');
        const listeCourses = JSON.parse(localStorage.getItem('listeCourses') || '[]');
        return { ingredients, mealpreps, planningMenu, listeCourses };
    }

    mettreAJourDashboard() {
        this.donnees = this.chargerToutesLesDonnees();
        this.genererApercuMenu();
        this.genererStatutMealPrep();
        this.genererListeCourses();
        this.calculerStatistiques();
        this.mettreAJourBadges();
    }

    setupEventListeners() {
        document.getElementById('btn-vider-courses').addEventListener('click', () => this.viderListeCourses());
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', () => this.mettreAJourDashboard());
    }

    // --- WIDGET MENU SEMAINE ---
    genererApercuMenu() {
        const container = document.getElementById('apercu-menu');
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        let html = '<div class="menu-apercu-grid">';
        
        jours.forEach(jour => {
            const jourData = this.donnees.planningMenu[jour] || { dejeuner: null, diner: null };
            html += `
                <div class="jour-apercu">
                    <div class="jour-nom">${jour.charAt(0).toUpperCase() + jour.slice(1, 3)}</div>
                    <div class="repas-apercu-item ${jourData.dejeuner ? 'planifie' : 'vide'}">
                        <span class="repas-nom">${jourData.dejeuner ? '✓' : '—'}</span>
                    </div>
                    <div class="repas-apercu-item ${jourData.diner ? 'planifie' : 'vide'}">
                        <span class="repas-nom">${jourData.diner ? '✓' : '—'}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // --- WIDGET MEAL PREP ---
    genererStatutMealPrep() {
        const container = document.getElementById('statut-mealprep');
        if (this.donnees.mealpreps.length === 0) {
            container.innerHTML = `<p class="empty-list-message">Aucun meal prep actif.</p>`;
            return;
        }
        
        let html = '';
        this.donnees.mealpreps.forEach(mp => {
            html += `<div class="mealprep-item"><strong>${mp.nom}</strong> <span>${mp.portions} portions restantes</span></div>`;
        });
        container.innerHTML = html;
    }

    // --- WIDGET LISTE DE COURSES ---
    genererListeCourses() {
        const container = document.getElementById('apercu-courses');
        const badge = document.getElementById('nb-articles');
        const { listeCourses } = this.donnees;
        
        badge.textContent = listeCourses.length;
        if (listeCourses.length === 0) {
            container.innerHTML = `<p class="liste-vide">✅ Votre liste de courses est vide !</p>`;
            return;
        }

        let html = '';
        listeCourses.slice(0, 4).forEach(item => {
            html += `<div class="course-item">${item.nom} <span>(${item.quantite} ${item.unite})</span></div>`;
        });
        if (listeCourses.length > 4) {
            html += `<div class="voir-plus">+ ${listeCourses.length - 4} autres...</div>`;
        }
        container.innerHTML = html;
    }

    viderListeCourses() {
        if (confirm("Voulez-vous vraiment vider la liste de courses ?")) {
            localStorage.setItem('listeCourses', '[]');
            this.mettreAJourDashboard();
        }
    }

    // --- WIDGET STATISTIQUES & BADGES ---
    calculerStatistiques() {
        const { ingredients, mealpreps, planningMenu } = this.donnees;
        document.getElementById('nb-ingredients').textContent = ingredients.length;
        document.getElementById('nb-mealpreps').textContent = mealpreps.length;

        const repasPlanifies = Object.values(planningMenu).reduce((acc, jour) => {
            return acc + (jour.dejeuner ? 1 : 0) + (jour.diner ? 1 : 0);
        }, 0);
        document.getElementById('repas-planifies').textContent = repasPlanifies;

        const taux = Math.round((repasPlanifies / 14) * 100);
        document.getElementById('taux-planification').textContent = `${taux}%`;
    }

    mettreAJourBadges() {
        const { ingredients, mealpreps, planningMenu } = this.donnees;
        const repasPlanifies = Object.values(planningMenu).reduce((acc, jour) => acc + (jour.dejeuner ? 1 : 0) + (jour.diner ? 1 : 0), 0);
        
        this.updateBadge('badge-placard', ingredients.length);
        this.updateBadge('badge-mealprep', mealpreps.length);
        this.updateBadge('badge-menu', repasPlanifies);
    }
    
    updateBadge(id, count) {
        const badge = document.getElementById(id);
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
}); 