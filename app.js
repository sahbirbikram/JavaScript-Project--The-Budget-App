

//BUDGET CONTROLLER
var budgetController = (function() {
    //some code here
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };
    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value,
        this.percentage = -1
    };

    Expenses.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };

    Expenses.prototype.getPercentage = function() {

        return this.percentage;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotals = function(type) {
        var sum = 0;

        // Calculate totals based on expense and income
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        //Store totals in data structure
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, description, value) {
            var ID, newItem;
            ID = 0;

            //Generate new ID for each new Item
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new Item based on income or expenses
            if (type === 'inc') {
                newItem = new Income (ID, description, value);
            } else if (type === 'exp') {
                newItem = new Expenses (ID, description, value);
            }

            //Store new items in data structure
            data.allItems[type].push(newItem);

            //Return new item
            return newItem;
        },

        deleteItem: function(type, ID) {
          //  
          var arrayID, index;
          
          arrayID = data.allItems[type].map(function(current) {
              return current.id;
          });
          index = arrayID.indexOf(ID);

          if (index !== -1) {
              //Delete the item
              data.allItems[type].splice(index, 1);
          }

        },

        calculateBudget: function() {

            //Calculate Totals
            calculateTotals('inc');
            calculateTotals('exp');

            //Calculate Budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                incomeTotal: data.totals.inc,
                expenseTotal: data.totals.exp,
                expensePercentage: data.percentage

            }
        },

        testing: function() {
            console.log(data);
        },
        
    };
})();

//UI CONTROLLER
var UIController = (function() {
    //some code here

    //Grouping all the DOM Strings
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpenseLabel: '.budget__expenses--value',
        budgetPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type) {
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        */
       var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' +int + '.' + dec;
    };

    var nodeListForEach = function(list, callBack) {
        for(var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };


    return {

        clearFields: function() {

            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(currentValue, index, array) {
                currentValue.value = '';
            });
            fieldsArray[0].focus();
            
        },
        
        //Get Input fron DOM and send to controller module
        getInput: function() {

            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addItem: function(object, type) {

            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">x</button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn">x</button></div></div></div>';
            }

            // Replace placeholder with actual value
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteItem: function(selectorID) {

            var element = document.getElementById(selectorID)
            element.parentNode.removeChild(element);
        },

        //Display budget to UI
        displayBudget: function(object) {
            var type;

            object.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(object.budget, type);
            document.querySelector(DOMStrings.budgetIncomeLabel).textContent = formatNumber(object.incomeTotal, 'inc');
            document.querySelector(DOMStrings.budgetExpenseLabel).textContent = formatNumber(object.expenseTotal, 'exp');
            
            if (object.expensePercentage > 0) {
                document.querySelector(DOMStrings.budgetPercentageLabel).textContent = object.expensePercentage + ' %';
            } else {
                document.querySelector(DOMStrings.budgetPercentageLabel).textContent = '---';
            }
            
        },

        displayPercentages: function(percentagesArr) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                // some stuff
                if (percentagesArr[index] > 0) {
                    current.textContent = percentagesArr[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });

        },

        displayDate: function() {

            var now, year, months, month;
            
            now = new Date();

            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','october', 'November', 'December']
            month = now.getMonth()
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            nodeListForEach(fields, function(current) {

                current.classList.toggle('red-focus');

            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');


        },


        //Making DOM strings public
        getDOMStrings: function() {
            return DOMStrings;
        },
    };

})();

//GLOBAL API CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    //some code here

    //Importing DOM strings from UI controller module
    var DOM = UICtrl.getDOMStrings();

    //Creating eventListners group
    var eventListners = function() {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
    
            if (event.keycode === 13 || event.which === 13 ) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var ctrlAddItem = function() {

        var input, newItem;

        //1. get input fields value
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add item to the data structure
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add Item to the UI
            UICtrl.addItem(newItem, input.type);

            //4. clear fields
            UICtrl.clearFields();

            //5. update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
            

        }

    };
    
    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.id;
        
        if (itemID) {

            splitID = itemID.split('-'); // this returns an array that contains ['inc','1'] for inc-1

            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages 
            updatePercentages();

        }
    }

    //Calculate and update budget
    var updateBudget = function() {

        //1. Calculate Budget
        budgetCtrl.calculateBudget();

        //2. return Budget
        var budget = budgetCtrl.getBudget();

        //3. Display Budget
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentageArray = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentageArray);
    }

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                incomeTotal: 0,
                expenseTotal: 0,
                expensePercentage: -1
            });
            eventListners();
        }
    }


})(budgetController, UIController);
controller.init();