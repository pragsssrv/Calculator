document.addEventListener('DOMContentLoaded', () => {
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
        history: '',
        memory: 0,
        error: false,
        isDegree: true,
    };

    const updateDisplay = () => {
        const display = document.querySelector('.calculator-screen');
        display.value = calculator.displayValue;
        const memoryDisplay = document.getElementById('memory-display');
        memoryDisplay.textContent = `M: ${calculator.memory}`;
    };

    const updateHistoryList = () => {
        const historyList = document.getElementById('history-list');
        const listItem = document.createElement('li');
        listItem.textContent = calculator.history;
        historyList.appendChild(listItem);
    };

    const handleDigit = (digit) => {
        if (calculator.error) return;

        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = calculator.displayValue === '0' ? digit : calculator.displayValue + digit;
        }
    };

    const handleOperator = (nextOperator) => {
        if (calculator.error) return;

        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);

        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }

        if (firstOperand == null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);

            if (result === 'Error') {
                calculator.displayValue = 'Error';
                calculator.error = true;
                return;
            }

            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
        }

        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
        updateHistory();
        highlightOperator(nextOperator);
    };

    const calculate = (firstOperand, secondOperand, operator) => {
        if (operator === '+') {
            return firstOperand + secondOperand;
        } else if (operator === '-') {
            return firstOperand - secondOperand;
        } else if (operator === '*') {
            return firstOperand * secondOperand;
        } else if (operator === '/') {
            return secondOperand === 0 ? 'Error' : firstOperand / secondOperand;
        }

        return secondOperand;
    };

    const updateHistory = () => {
        const { firstOperand, displayValue, operator } = calculator;
        calculator.history += `${firstOperand || ''} ${operator || ''} ${displayValue || ''} = ${calculator.displayValue}\n`;
        updateHistoryList();
    };

    const handleDecimal = (dot) => {
        if (calculator.error) return;

        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }

        if (!calculator.displayValue.includes(dot)) {
            calculator.displayValue += dot;
        }
    };

    const resetCalculator = () => {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
        calculator.history = '';
        calculator.memory = 0;
        calculator.error = false;
        highlightOperator(null);
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
    };

    const clearEntry = () => {
        const { displayValue } = calculator;

        if (displayValue.length === 1) {
            calculator.displayValue = '0';
        } else {
            calculator.displayValue = displayValue.slice(0, -1);
        }
    };

    const handleMemory = (operation) => {
        const { displayValue, error } = calculator;
        const inputValue = parseFloat(displayValue);

        if (isNaN(inputValue) || error) return;

        switch (operation) {
            case 'mc':
                calculator.memory = 0;
                break;
            case 'mr':
                calculator.displayValue = calculator.memory.toString();
                break;
            case 'm+':
                calculator.memory += inputValue;
                break;
            case 'm-':
                calculator.memory -= inputValue;
                break;
        }
    };

    const handleScientific = (operation) => {
        const { displayValue, error, isDegree } = calculator;
        const inputValue = parseFloat(displayValue);
        let angle = inputValue;

        if (isDegree) {
            angle = inputValue * (Math.PI / 180);
        }

        if (isNaN(inputValue) || error) return;

        let result;
        switch (operation) {
            case 'square':
                result = inputValue * inputValue;
                break;
            case 'sqrt':
                result = Math.sqrt(inputValue);
                break;
            case 'sin':
                result = Math.sin(angle);
                break;
            case 'cos':
                result = Math.cos(angle);
                break;
            case 'tan':
                result = Math.tan(angle);
                break;
            case 'exp':
                result = Math.exp(inputValue);
                break;
            case 'log':
                result = Math.log(inputValue);
                break;
            default:
                return;
        }

        calculator.displayValue = result.toString();
        updateHistory();
    };

    const highlightOperator = (operator) => {
        const operatorButtons = document.querySelectorAll('.operator');
        operatorButtons.forEach(button => {
            button.style.backgroundColor = (button.value === operator) ? '#fbc02d' : '#f9a825';
        });
    };

    const keys = document.querySelector('.calculator-keys');
    keys.addEventListener('click', (event) => {
        const { target } = event;
        if (!target.matches('button')) return;

        const { value } = target;

        switch (value) {
            case '+':
            case '-':
            case '*':
            case '/':
            case '=':
                handleOperator(value);
                break;
            case '.':
                handleDecimal(value);
                break;
            case 'all-clear':
                resetCalculator();
                break;
            case 'clear-entry':
                clearEntry();
                break;
            case 'mc':
            case 'mr':
            case 'm+':
            case 'm-':
                handleMemory(value);
                break;
            case 'square':
            case 'sqrt':
            case 'sin':
            case 'cos':
            case 'tan':
            case 'exp':
            case 'log':
                handleScientific(value);
                break;
            case '(':
            case ')':
                handleDigit(value);
                break;
            default:
                if (Number.isInteger(parseFloat(value))) {
                    handleDigit(value);
                }
        }

        updateDisplay();
    });

    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (key >= 0 && key <= 9) {
            handleDigit(key);
        } else if (key === '.') {
            handleDecimal(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            handleOperator(key);
        } else if (key === 'Enter' || key === '=') {
            handleOperator('=');
        } else if (key === 'Backspace') {
            calculator.displayValue = calculator.displayValue.slice(0, -1) || '0';
        } else if (key === 'Escape') {
            resetCalculator();
        } else if (key === '(' || key === ')') {
            handleDigit(key);
        }

        updateDisplay();
    });

    document.getElementById('mode-toggle').addEventListener('change', (event) => {
        const scientificKeys = document.querySelector('.scientific-keys');
        if (event.target.checked) {
            scientificKeys.style.display = 'grid';
        } else {
            scientificKeys.style.display = 'none';
        }
        document.querySelector('.calculator').classList.toggle('scientific-mode', event.target.checked);
    });

    document.getElementById('theme-toggle').addEventListener('change', (event) => {
        document.body.classList.toggle('light-theme', event.target.checked);
    });

    document.getElementById('degree-toggle').addEventListener('change', (event) => {
        calculator.isDegree = event.target.checked;
    });

    document.getElementById('clear-history').addEventListener('click', () => {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        calculator.history = '';
    });

    updateDisplay();
});
