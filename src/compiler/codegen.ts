import { Node } from './parser';

export class CodeGenerator {
    private output: string = '';
    private indentLevel: number = 0;

    private indent(): void {
        this.indentLevel++;
    }

    private dedent(): void {
        this.indentLevel--;
    }

    private emit(code: string): void {
        const indentation = '  '.repeat(this.indentLevel);
        this.output += indentation + code + '\n';
    }

    public generate(ast: Node[]): string {
        this.output = '';
        
        // En-tête du fichier généré
        this.emit('// Code généré par TriforceScript');
        this.emit('');

        // Génération du code pour chaque nœud de l'AST
        for (const node of ast) {
            this.emit(this.generateNode(node));
        }

        return this.output;
    }

    private generateNode(node: Node, indent: string = ''): string {
        switch (node.type) {
            case 'Program':
                return node.body.map((stmt: Node) => 
                    this.generateNode(stmt, indent)
                ).join('\n');
            
            case 'Comment':
                return `${indent}// ${node.value}`;
            
            case 'TypeDeclaration':
                return this.generateTypeDeclaration(node, indent);
            
            case 'Assignment':
                return this.generateAssignment(node, indent);
            
            case 'BinaryExpression':
                return this.generateBinaryExpression(node, indent);
            
            case 'IfStatement':
                return this.generateIfStatement(node, indent);
            
            case 'Block':
                const statements = node.statements
                    .map((stmt: Node) => this.generateNode(stmt, indent + '  '))
                    .join('\n');
                return `${indent}{\n${statements}\n${indent}}`;
            
            case 'WriteStatement':
                const args = node.arguments.map((arg: Node) => this.generateNode(arg)).join(', ');
                return `${indent}console.log(${args});`;
            
            case 'Identifier':
                return node.value;
            
            case 'Literal':
                return typeof node.value === 'string' ? `"${node.value}"` : String(node.value);
            
            case 'StringLiteral':
                return `"${node.value}"`;
            
            default:
                throw new Error(`Type de nœud non pris en charge : ${node.type}`);
        }
    }

    private generateBinaryExpression(node: Node, indent: string = ''): string {
        const left = this.generateNode(node.left);
        const right = this.generateNode(node.right);
        
        switch (node.operator) {
            case '->':
                // Ajouter un espace entre les éléments concaténés
                return `${left} + " " + ${right}`;
            case '==':
                return `${left} === ${right}`;
            default:
                return `(${left} ${node.operator} ${right})`;
        }
    }

    private generateTypeDeclaration(node: Node, indent: string = ''): string {
        return `${indent}let ${node.name} = ${this.generateNode(node.value)};`;
    }

    private generateAssignment(node: Node, indent: string = ''): string {
        const name = node.name;
        const value = this.generateNode(node.value);
        return `${indent}${name} = ${value};`;
    }

    private generateBlock(node: Node, indent: string = ''): string {
        const statements = node.statements.map((stmt: Node) => 
            this.generateNode(stmt, indent + '  ')
        ).join('\n');
        return `{\n${statements}\n${indent}}`;
    }

    private generateIfStatement(node: Node, indent: string = ''): string {
        const condition = this.generateNode(node.condition);
        const thenBranch = this.generateNode(node.thenBranch, indent);
        let result = `${indent}if (${condition}) ${thenBranch}`;
        
        if (node.elseBranch) {
            result += ` else ${this.generateNode(node.elseBranch, indent)}`;
        }
        
        return result;
    }

    private generateExpressionStatement(node: Node, indent: string = ''): string {
        return `${indent}${this.generateNode(node.expression)};`;
    }

    private generateFunctionDeclaration(node: Node, indent: string = ''): string {
        const params = node.parameters.join(', ');
        const body = this.generateNode(node.body, indent);
        return `${indent}function ${node.name}(${params}) ${body}`;
    }

    private generateVariableDeclaration(node: Node, indent: string = ''): string {
        const initializer = node.initializer ? ` = ${this.generateNode(node.initializer)}` : '';
        return `${indent}let ${node.name}${initializer};`;
    }

    private generateReturnStatement(node: Node, indent: string = ''): string {
        if (node.value) {
            return `${indent}return ${this.generateNode(node.value)};`;
        }
        return `${indent}return;`;
    }
}
