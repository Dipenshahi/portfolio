document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');
    let currentInput = '';
    let lastInput = '';
    let resetNext = false;

    function isOperator(char) {
        return ['+', '-', '*', '/'].includes(char);
    }

    function updateDisplay(value) {
        display.textContent = value;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const btnValue = button.textContent;

            if (button.classList.contains('clear')) {
                currentInput = '';
                updateDisplay('0');
                resetNext = false;
                return;
            }

            if (button.classList.contains('equal')) {
                try {
                    // Evaluate the expression safely
                    let result = eval(currentInput);
                    if (result === undefined) {
                        result = '';
                    }
                    updateDisplay(result);
                    currentInput = result.toString();
                    resetNext = true;
                } catch (e) {
                    updateDisplay('Error');
                    currentInput = '';
                    resetNext = true;
                }
                return;
            }

            if (resetNext) {
                if (isOperator(btnValue)) {
                    // Continue calculation with operator
                    resetNext = false;
                } else {
                    // Start new input
                    currentInput = '';
                    resetNext = false;
                }
            }

            if (isOperator(btnValue)) {
                // Prevent two operators in a row
                if (currentInput === '' && btnValue !== '-') {
                    // Do not allow operator at start except minus
                    return;
                }
                if (isOperator(lastInput)) {
                    // Replace last operator with new one
                    currentInput = currentInput.slice(0, -1);
                }
                currentInput += btnValue;
            } else {
                currentInput += btnValue;
            }

            lastInput = btnValue;
            updateDisplay(currentInput);
        });
    });
});
