#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { Lexer } from './compiler/lexer';
import { Parser } from './compiler/parser';
import { CodeGenerator } from './compiler/codegen';
import chalk from 'chalk';

program
    .version('0.1.0')
    .description('TriforceScript - Un langage de programmation moderne pour le développement front-end')
    .argument('<file>', 'Fichier source TriforceScript à compiler')
    .option('-o, --output <file>', 'Fichier de sortie JavaScript', 'output.js')
    .option('-v, --verbose', 'Afficher les détails de compilation')
    .parse(process.argv);

const options = program.opts();
const [sourceFile] = program.args;

try {
    console.log(chalk.blue('🔮 TriforceScript Compiler'));
    
    // Lecture du fichier source
    const sourceCode = readFileSync(sourceFile, 'utf-8');
    if (options.verbose) {
        console.log(chalk.gray('📖 Lecture du fichier source...'));
    }

    // Analyse lexicale
    if (options.verbose) {
        console.log(chalk.gray('🔍 Analyse lexicale...'));
    }
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.scanTokens();

    if (options.verbose) {
        console.log('🔍 Analyse lexicale...');
        tokens.forEach((token: { type: string; value: string; line: number; column: number }) => {
            console.log(`Token: ${token.type} (${token.value}) à la ligne ${token.line}, colonne ${token.column}`);
        });
    }

    // Analyse syntaxique
    if (options.verbose) {
        console.log(chalk.gray('🔧 Analyse syntaxique...'));
    }
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Génération de code
    if (options.verbose) {
        console.log(chalk.gray('⚡ Génération du code JavaScript...'));
    }
    const generator = new CodeGenerator();
    const jsCode = generator.generate(ast);

    // Écriture du fichier de sortie
    writeFileSync(options.output, jsCode);
    
    console.log(chalk.green('✨ Compilation terminée avec succès !'));
    console.log(chalk.gray(`📝 Code généré dans ${options.output}`));

    // Exécution du code généré
    console.log(chalk.blue('\n🚀 Exécution du programme :'));
    console.log(chalk.yellow('-------------------'));
    eval(jsCode);
    console.log(chalk.yellow('-------------------'));

} catch (error: any) {
    console.error(chalk.red('❌ Erreur de compilation :'));
    console.error(chalk.red(error.message));
    process.exit(1);
}
