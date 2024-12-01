export enum TokenType {
    // Mots-clés
    LET = 'LET',
    CONST = 'CONST',
    FUNCTION = 'FUNCTION',
    RETURN = 'RETURN',
    IF = 'IF',
    ELSE = 'ELSE',
    FOR = 'FOR',
    WHILE = 'WHILE',
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    NULL = 'NULL',
    
    // Types
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    
    // Opérateurs
    EQUALS = 'EQUALS',
    EQUALS_EQUALS = 'EQUALS_EQUALS',
    BANG = 'BANG',
    BANG_EQUALS = 'BANG_EQUALS',
    GREATER = 'GREATER',
    GREATER_EQUALS = 'GREATER_EQUALS',
    LESS = 'LESS',
    LESS_EQUALS = 'LESS_EQUALS',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MULTIPLY = 'MULTIPLY',
    DIVIDE = 'DIVIDE',
    DOT = 'DOT',
    ARROW = 'ARROW',              // ->
    DOUBLE_ARROW = 'DOUBLE_ARROW', // =>
    TYPE_DECL = 'TYPE_DECL',      // ::
    TYPE_START = 'TYPE_START',     // [
    TYPE_END = 'TYPE_END',        // ]
    COMMENT = 'COMMENT',           // /_\
    COLON = 'COLON',               // :
    
    // Délimiteurs
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    LBRACE = 'LBRACE',
    RBRACE = 'RBRACE',
    SEMICOLON = 'SEMICOLON',
    COMMA = 'COMMA',
    
    // Autres
    IDENTIFIER = 'IDENTIFIER',
    EOF = 'EOF',
    WRITE = 'WRITE',              // write
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

export class Lexer {
    private source: string;
    private tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;
    private column = 1;

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.addToken(TokenType.EOF);
        return this.tokens;
    }

    private scanToken(): void {
        const c = this.advance();
        
        switch (c) {
            case '(':
                this.addToken(TokenType.LPAREN);
                break;
            case ')':
                this.addToken(TokenType.RPAREN);
                break;
            case '{':
                this.addToken(TokenType.LBRACE);
                break;
            case '}':
                this.addToken(TokenType.RBRACE);
                break;
            case '[':
                this.addToken(TokenType.TYPE_START);
                break;
            case ']':
                this.addToken(TokenType.TYPE_END);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case ':':
                if (this.match(':')) {
                    this.addToken(TokenType.TYPE_DECL);
                }
                break;
            case '=':
                if (this.match('=')) {
                    this.addToken(TokenType.EQUALS_EQUALS);
                } else if (this.match('>')) {
                    this.addToken(TokenType.DOUBLE_ARROW);
                } else {
                    this.addToken(TokenType.EQUALS);
                }
                break;
            case '-':
                if (this.match('>')) {
                    this.addToken(TokenType.ARROW);
                }
                break;
            case '"':
                this.string();
                break;
            case '/':
                if (this.match('_') && this.match('\\')) {
                    this.comment();
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;
            case '\n':
                this.line++;
                this.column = 1;
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    throw new Error(`Caractère inattendu '${c}' à la ligne ${this.line}`);
                }
                break;
        }
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(): string {
        const char = this.source.charAt(this.current++);
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return char;
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;

        this.current++;
        this.column++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private string(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
                this.column = 1;
            }
            this.advance();
        }

        if (this.isAtEnd()) {
            throw new Error(`Chaîne non terminée à la ligne ${this.line}`);
        }

        // The closing "
        this.advance();

        // Trim the surrounding quotes
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private comment(): void {
        while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
        }
        
        const value = this.source.substring(this.start + 3, this.current).trim();
        this.addToken(TokenType.COMMENT, value);
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }

        const value = this.source.substring(this.start, this.current);
        this.addToken(TokenType.NUMBER, value);
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        let type = TokenType.IDENTIFIER;

        switch (text) {
            case 'if': type = TokenType.IF; break;
            case 'write': type = TokenType.WRITE; break;
        }

        this.addToken(type);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') ||
               (c >= 'A' && c <= 'Z') ||
               c === '_';
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private addToken(type: TokenType, value: string = ""): void {
        const text = value || this.source.substring(this.start, this.current);
        this.tokens.push({
            type,
            value: text,
            line: this.line,
            column: this.column
        });
    }
}
