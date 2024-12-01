import { Token, TokenType } from './lexer';

export interface Node {
    type: string;
    [key: string]: any;
}

export class Parser {
    private tokens: Token[] = [];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) {
            console.log(`Check: End of file`);
            return false;
        }
        const result = this.peek().type === type;
        console.log(`Check: Looking for ${type}, found ${this.peek().type} (${this.peek().value}), result: ${result}`);
        return result;
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                console.log(`Match: Found ${type}`);
                this.advance();
                return true;
            }
        }
        console.log(`Match: Did not find ${types.join(', ')}`);
        return false;
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        
        // Afficher plus d'informations pour le débogage
        const token = this.peek();
        throw new Error(`${message} à la ligne ${token.line}. Token trouvé : ${token.type} (${token.value})`);
    }

    public parse(): Node[] {
        const statements: Node[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }
        return statements;
    }

    private declaration(): Node {
        if (this.match(TokenType.COMMENT)) {
            // Ignorer les commentaires
            return {
                type: "Comment",
                value: this.previous().value
            };
        }

        if (this.check(TokenType.IDENTIFIER)) {
            const identifier = this.advance();
            console.log(`Parsing identifier: ${identifier.value}`);
            
            if (this.match(TokenType.TYPE_DECL)) {
                console.log(`Found type declaration for ${identifier.value}`);
                
                // Si le prochain token est un identifiant, c'est une réassignation
                if (this.check(TokenType.IDENTIFIER)) {
                    console.log(`Found identifier after ::, treating as reassignment`);
                    const value = this.expression();
                    return {
                        type: "Assignment",
                        name: identifier.value,
                        value: value
                    };
                }
                
                console.log(`No identifier found after ::, expecting type declaration`);
                // Sinon c'est une déclaration de type
                this.consume(TokenType.TYPE_START, "[ attendu après ::");
                const type = this.consume(TokenType.IDENTIFIER, "Type attendu");
                this.consume(TokenType.TYPE_END, "] attendu");
                this.consume(TokenType.ARROW, "-> attendu");
                const value = this.expression();

                return {
                    type: "TypeDeclaration",
                    name: identifier.value,
                    valueType: type.value,
                    value: value
                };
            } else if (this.match(TokenType.ARROW)) {
                console.log(`Found arrow for ${identifier.value}`);
                const value = this.expression();
                return {
                    type: "Assignment",
                    name: identifier.value,
                    value: value
                };
            }
        }

        if (this.match(TokenType.IF)) {
            console.log("Parsing if statement");
            this.consume(TokenType.ARROW, "-> attendu après if");
            const condition = this.expression();
            this.consume(TokenType.DOUBLE_ARROW, "=> attendu après la condition");
            const thenBranch = this.block();

            return {
                type: "IfStatement",
                condition: condition,
                thenBranch: thenBranch
            };
        }

        if (this.match(TokenType.WRITE)) {
            console.log("Parsing write statement");
            return this.writeStatement();
        }

        return this.expressionStatement();
    }

    private expression(): Node {
        return this.equality();
    }

    private equality(): Node {
        let expr = this.concatenation();

        while (this.match(TokenType.EQUALS_EQUALS)) {
            const operator = "==";
            const right = this.concatenation();
            expr = {
                type: "BinaryExpression",
                operator: operator,
                left: expr,
                right: right
            };
        }

        return expr;
    }

    private concatenation(): Node {
        let expr = this.primary();

        while (this.match(TokenType.ARROW)) {
            const right = this.primary();
            expr = {
                type: "BinaryExpression",
                operator: "->",
                left: expr,
                right: right
            };
        }

        return expr;
    }

    private primary(): Node {
        if (this.match(TokenType.STRING)) {
            return {
                type: "StringLiteral",
                value: this.previous().value
            };
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return {
                type: "Identifier",
                value: this.previous().value
            };
        }

        throw new Error(`Expression attendue à la ligne ${this.peek().line}`);
    }

    private writeStatement(): Node {
        this.consume(TokenType.LPAREN, "( attendu");
        const args = [];
        
        if (!this.check(TokenType.RPAREN)) {
            do {
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }
        
        this.consume(TokenType.RPAREN, ") attendu");
        
        return {
            type: "WriteStatement",
            arguments: args
        };
    }

    private block(): Node {
        this.consume(TokenType.LBRACE, "{ attendu");
        
        const statements = [];
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        
        this.consume(TokenType.RBRACE, "} attendu");
        
        return {
            type: "Block",
            statements: statements
        };
    }

    private ifStatement(): Node {
        const condition = this.expression();
        this.consume(TokenType.DOUBLE_ARROW, "=> attendu après la condition");
        const thenBranch = this.block();

        return {
            type: "IfStatement",
            condition: condition,
            thenBranch: thenBranch
        };
    }

    private varDeclaration(): Node {
        const name = this.consume(TokenType.IDENTIFIER, "Nom de variable attendu");

        let initializer = null;
        if (this.match(TokenType.EQUALS)) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "';' attendu après la déclaration de variable");

        return {
            type: "VariableDeclaration",
            name: name.value,
            initializer
        };
    }

    private functionDeclaration(): Node {
        const name = this.consume(TokenType.IDENTIFIER, "Nom de fonction attendu");
        this.consume(TokenType.LPAREN, "'(' attendu");
        
        const parameters: string[] = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                parameters.push(this.consume(TokenType.IDENTIFIER, "Nom de paramètre attendu").value);
            } while (this.match(TokenType.COMMA));
        }
        
        this.consume(TokenType.RPAREN, "')' attendu");
        
        return {
            type: "FunctionDeclaration",
            name: name.value,
            parameters,
            body: {
                type: "Block",
                statements: this.block()
            }
        };
    }

    private statement(): Node {
        if (this.match(TokenType.IF)) {
            return this.ifStatement();
        }
        if (this.match(TokenType.RETURN)) {
            return this.returnStatement();
        }
        if (this.match(TokenType.WHILE)) {
            return this.whileStatement();
        }
        if (this.match(TokenType.FOR)) {
            return this.forStatement();
        }
        if (this.match(TokenType.LBRACE)) {
            return {
                type: "Block",
                statements: this.block()
            };
        }

        return this.expressionStatement();
    }

    private returnStatement(): Node {
        const keyword = this.previous();
        let value = null;
        if (!this.check(TokenType.SEMICOLON)) {
            value = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "';' attendu après l'instruction return");
        return {
            type: "ReturnStatement",
            value
        };
    }

    private whileStatement(): Node {
        this.consume(TokenType.LPAREN, "'(' attendu après 'while'");
        const condition = this.expression();
        this.consume(TokenType.RPAREN, "')' attendu après la condition");
        const body = this.statement();

        return {
            type: "WhileStatement",
            condition,
            body
        };
    }

    private forStatement(): Node {
        this.consume(TokenType.LPAREN, "'(' attendu après 'for'");
        
        // Initialisation
        let initializer;
        if (this.match(TokenType.SEMICOLON)) {
            initializer = null;
        } else if (this.match(TokenType.LET)) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        // Condition
        let condition = null;
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "';' attendu après la condition de la boucle");

        // Incrément
        let increment = null;
        if (!this.check(TokenType.RPAREN)) {
            increment = this.expression();
        }
        this.consume(TokenType.RPAREN, "')' attendu après les clauses for");

        let body = this.statement();

        return {
            type: "ForStatement",
            initializer,
            condition,
            increment,
            body
        };
    }

    private assignment(): Node {
        let expr = this.equality();

        if (this.match(TokenType.EQUALS)) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr.type === "Identifier") {
                return {
                    type: "Assignment",
                    name: expr.name,
                    value
                };
            } else if (expr.type === "Get") {
                return {
                    type: "MemberAssignment",
                    object: expr.object,
                    property: expr.name,
                    value
                };
            }

            throw new Error("Cible d'assignation invalide");
        }

        return expr;
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.FUNCTION:
                case TokenType.LET:
                case TokenType.CONST:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }

    private expressionStatement(): Node {
        const expr = this.expression();
        return {
            type: "ExpressionStatement",
            expression: expr
        };
    }
}
