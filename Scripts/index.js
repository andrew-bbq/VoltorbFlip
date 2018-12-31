var vm = new Vue({
    el: '#container',
    data: {
        board: [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]],
        displayBoard: [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4], [4, 4, 4, 4, 4]],
        bombCount: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        totalCount: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        roundScore: 0,
        totalScore: 0,
        BOMBS: [0, 6, 7, 8, 9, 10, 10, 10, 10],
        level: 1,
        MULTIPLIERS: [24, 54, 108, 216, 384, 648, 1296, 2600, 6000],
        cardsFlipped: 0,
        maxValue: 0,
        toAdd: { size: 0, head: null },
        gameState: 0,
    },
    methods: {
        //add new item on top of stack
        push: function (stack, value) {
            var toPush = { value: value, link: null };
            toPush.link = stack.head;
            stack.head = toPush;
            stack.size++;
        },
        //remove lead item from stack
        pop: function (stack) {
            var toReturn = stack.head.value;
            stack.head = stack.head.link;
            stack.size--;
            return toReturn;
        },
        /**
         * generate multipliers to add into board
         * @param {int} level level to generate total score for
         * @param {stack} stack stack to fill multipliers into
         */
        generateMultipliers: function (level, stack) {
            while (stack.size > 0) {
                this.pop(stack);
            }
            //Actual value, used in case value is short of bounds
            var actual = 1;
            var total = this.MULTIPLIERS[level - 1];
            total += (this.MULTIPLIERS[level] - this.MULTIPLIERS[level - 1]) * Math.random();
            //Check if less than 2 to avoid going too high (Can result in going too low)
            while (total > 2) {
                if ((total / 3) < 1) {
                    this.push(stack, 2);
                    actual *= 2;
                    total /= 2;
                } else {
                    if (Math.random() > .5) {
                        this.push(stack, 3);
                        actual *= 3;
                        total /= 3;
                    } else {
                        this.push(stack, 2);
                        actual *= 2;
                        total /= 2;
                    }
                }
            }
            //Compensate if too low
            if (actual < this.MULTIPLIERS[level - 1]) {
                this.push(stack, 2);
                actual *= 2;
            }
            this.maxValue = actual;
        },
        fillBombs: function (board) {
            var toFill = this.BOMBS[this.level];
            while (toFill > 0) {
                var i = Math.floor(Math.random() * 5);
                var j = Math.floor(Math.random() * 5);
                if (board[i][j] == 1) {
                    board[i][j] = 0;
                    toFill--;
                }
            }
        },
        fillMultipliers: function (board, stack) {
            while (stack.size > 0) {
                var didSet = true;
                var toAdd = this.pop(stack);
                while (didSet) {
                    var i = Math.floor(Math.random() * 5);
                    var j = Math.floor(Math.random() * 5);
                    if (board[i][j] == 1) {
                        board[i][j] = toAdd;
                        didSet = false;
                    }
                }
            }
        },
        generateBoard: function () {
            this.gameState = 1;
            this.cardsFlipped = 0;
            this.cleanBoard(this.displayBoard, 4);
            this.cleanBoard(this.board, 1);
            this.fillBombs(this.board);
            this.generateMultipliers(this.level, this.toAdd);
            this.fillMultipliers(this.board, this.toAdd);
            this.countBombs(this.board);
            this.countTotals(this.board);

            //force display to update
            vm.$forceUpdate();
        },
        cleanBoard: function (board, toSet) {
            for (var i = 0; i < board.length; i++) {
                for (var j = 0; j < board[i].length; j++) {
                    board[i][j] = toSet;
                }
            }
        },
        select: function (i, j) {
            if (this.gameState != 0) {
                var cellValue = this.board[i][j];
                if (this.roundScore == 0) {
                    this.roundScore = 1;
                }
                this.roundScore *= cellValue;
                if (cellValue == 0) {
                    this.gameState = 0;
                    if (this.cardsFlipped < this.level) {
                        this.level = this.cardsFlipped;
                    }
                }
                this.cardsFlipped++;
                if (this.roundScore == this.maxValue) {
                    this.totalScore += this.roundScore;
                    this.roundScore = 0;
                    this.level++;
                    this.gameState = 0;
                }
                this.displayBoard[i][j] = cellValue;
                //force display to update
                vm.$forceUpdate();
            }
        },
        countBombs: function (board) {
            //it's a square so we can cheat it to make this function shorter
            for (var i = 0; i < board.length; i++) {
                var curRow = 0;
                var curCol = 0;
                for (var j = 0; j < board.length; j++) {
                    if (board[i][j] == 0) {
                        curRow++;
                    }
                    if (board[j][i] == 0) {
                        curCol++;
                    }
                }
                this.bombCount[0][i] = curRow;
                this.bombCount[1][i] = curCol;
            }
        },
        countTotals: function (board) {
            //square again, easy to cheat
            for (var i = 0; i < board.length; i++) {
                var curRow = 0;
                var curCol = 0;
                for (var j = 0; j < board.length; j++) {
                    curRow += board[i][j];
                    curCol += board[j][i];
                }
                this.totalCount[0][i] = curRow;
                this.totalCount[1][i] = curCol;
            }
        }
    },
});
