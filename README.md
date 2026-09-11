# OMP Gabon - Supervision Portuaire

## Système de gestion de maintenance

Application web de supervision et de gestion de la maintenance des équipements du terminal portuaire d'Owendo.

### Fonctionnalités

- Dashboard de maintenance
- Gestion des équipements
- Gestion des pannes
- Gestion des Work Orders
-  Gestion des techniciens
- Gestion des pièces de rechange
-  Maintenance préventive
-  Historique des interventions
-  Calcul des KPI de maintenance
-  Import de documents et fichiers Excel
-  Stockage des documents avec Supabase Storage
-  Base de données Supabase

### Technologies utilisées

- React
- JavaScript / TypeScript
- Vite
- Supabase
- Supabase Database
- Supabase Storage
- HTML / CSS

### Architecture

```text
Frontend React
      │
      ▼
Supabase
 
 │   Database    
 │ équipements   
 │ pannes        
 │ work_orders   
 │ techniciens   
 │ pièces        
 
      │
      ▼
Supabase Storage
      │
      ▼
Documents / Excel / fichiers