class Calculator {
    constructor() {
        this.history = document.getElementById('history');
        this.result = document.getElementById('result');
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;

        this.setupEventListeners();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        document.querySelectorAll('.key').forEach(button => {
            button.addEventListener('click', () => {
                this.handleInput(button.textContent);
                this.addClickEffect(button);
            });
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    setupThemeToggle() {
        // Load saved theme
        const savedTheme = localStorage.getItem('calculator-theme') || 'modern';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Theme toggle buttons
        document.getElementById('modern-theme').addEventListener('click', () => this.setTheme('modern'));
        document.getElementById('retro-theme').addEventListener('click', () => this.setTheme('retro'));
        document.getElementById('cyber-theme').addEventListener('click', () => this.setTheme('cyber'));
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('calculator-theme', theme);
        
        // Add theme change animation
        const calculator = document.querySelector('.calculator');
        calculator.style.animation = 'none';
        calculator.offsetHeight; // Trigger reflow
        calculator.style.animation = 'floating 3s ease-in-out infinite'; // Reapply floating animation
    }

    addClickEffect(button) {
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 100);
    }

    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') this.appendNumber(e.key);
        if (e.key === '.') this.appendNumber('.');
        if (e.key === '=' || e.key === 'Enter') this.evaluate();
        if (e.key === 'Backspace') this.delete();
        if (e.key === 'Escape') this.clear();
        if (['+', '-', '*', '/', '%'].includes(e.key)) {
            const operatorMap = {
                '*': '×',
                '/': '÷'
            };
            this.setOperation(operatorMap[e.key] || e.key);
        }
    }

    handleInput(value) {
        if (value >= '0' && value <= '9' || value === '.') {
            this.appendNumber(value);
        } else if (['+', '-', '×', '÷', '%'].includes(value)) {
            this.setOperation(value);
        } else if (value === '=') {
            this.evaluate();
        } else if (value === 'AC') {
            this.clear();
        } else if (value === '±') {
            this.toggleSign();
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    setOperation(operator) {
        if (this.operation !== undefined) {
            this.evaluate();
        }
        this.operation = operator;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    toggleSign() {
        this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
        this.updateDisplay();
    }

    evaluate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.result.textContent = 'Error';
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = (prev / 100) * current;
                break;
            default:
                return;
        }

        this.history.textContent = `${this.formatNumber(prev)} ${this.operation} ${this.formatNumber(current)} =`;
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.history.textContent = '';
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    formatNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '0';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.result.textContent = this.formatNumber(this.currentOperand);
        if (this.operation != null) {
            this.history.textContent = `${this.formatNumber(this.previousOperand)} ${this.operation}`;
        }
    }
}

// Initialize calculator
new Calculator();