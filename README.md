# TriforceScript

Un langage de programmation révolutionnaire pour le développement front-end moderne.

## 🚀 Caractéristiques

- **Polyvalence syntaxique** : Support des styles impératif, déclaratif et fonctionnel
- **Interopérabilité native** : Compatible avec l'écosystème JavaScript existant
- **Optimisation automatique** : Compilation intelligente pour des performances optimales
- **Typage flexible** : Choix entre typage statique et dynamique
- **DOM virtuel avancé** : Performances UI optimisées
- **Sécurité renforcée** : Protection contre XSS et CSRF intégrée
- **Système de modules** : Organisation structurée du code

## 🛠️ Technologies

- Compilateur LLVM
- WebAssembly
- Node.js

## 🔧 Installation

```bash
# Installation globale
npm install -g triforcescript

# Installation locale dans votre projet
npm install triforcescript
```

## 🚀 Démarrage rapide

1. **Créer un nouveau projet**
   ```bash
   mkdir mon-projet-tfs
   cd mon-projet-tfs
   npm init -y
   npm install triforcescript
   ```

2. **Créer votre premier fichier TriforceScript**
   Créez un fichier `app.tfs` :
   ```typescript
   component App {
     state = {
       count: 0
     }

     increment() {
       this.state.count++
     }

     render() {
       return <div>
         <h1>Compteur: {this.state.count}</h1>
         <button onClick={this.increment}>Incrémenter</button>
       </div>
     }
   }
   ```

3. **Compiler et exécuter**
   ```bash
   # Compilation
   tfs build app.tfs

   # Exécution
   tfs run app.js
   ```

## 📖 Guide d'utilisation

### Scripts NPM disponibles

- `npm run build` : Compile les fichiers TypeScript
- `npm run start` : Lance l'application compilée
- `npm run dev` : Mode développement avec rechargement à chaud
- `npm run test` : Lance les tests
- `npm run lint` : Vérifie la qualité du code
- `npm run tfs` : Compile et exécute le compilateur
- `npm run tfs:watch` : Mode watch pour le développement
- `npm run tfs:clean` : Nettoie les fichiers de build
- `npm run tfs:example` : Lance les exemples

### Structure de projet recommandée

```
mon-projet-tfs/
├── src/
│   ├── components/
│   │   └── App.tfs
│   ├── styles/
│   │   └── main.css
│   └── index.tfs
├── dist/
├── tests/
├── package.json
└── tsconfig.json
```

### Exemples d'utilisation

1. **Composant simple**
   ```typescript
   component Button {
     props: {
       text: string,
       onClick: () => void
     }

     render() {
       return <button onClick={this.props.onClick}>
         {this.props.text}
       </button>
     }
   }
   ```

2. **Gestion d'état**
   ```typescript
   import { useState } from 'triforcescript'

   component Counter {
     const [count, setCount] = useState(0)

     render() {
       return <div>
         <p>Count: {count}</p>
         <button onClick={() => setCount(count + 1)}>
           Increment
         </button>
       </div>
     }
   }
   ```

## 🔍 Débogage

- Utilisez `tfs debug` pour lancer le mode débogage
- Les logs sont disponibles dans `./logs/tfs-debug.log`
- Le debugger Chrome DevTools est compatible

## 📚 Documentation

Visitez [docs.triforcescript.io](https://docs.triforcescript.io) pour la documentation complète, incluant :
- Guide complet de la syntaxe
- Tutoriels pas à pas
- Exemples de projets
- API de référence
- Bonnes pratiques

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

TriforceScript est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
