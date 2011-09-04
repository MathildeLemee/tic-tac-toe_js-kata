Game = function() {
    this.fields = ['_', '_', '_', '_', '_', '_', '_', '_', '_'];
    this.curPlayer = "X";
    this.winner;
}
Game.prototype = {
    take: function(field) {
        if (this.fields[field - 1] == '_') {
            this.fields[field - 1] = this.curPlayer;
            this.curPlayer = this.otherPlayer();
            return true;
        }
        return false;
    },
    isFinished: function() {
        var all = this.fields.every(function(field) {
            return field != "_";
        });
        var ligne = this.fields[0] + this.fields[1] + this.fields[2] + "|" + this.fields[3] + this.fields[4] + this.fields[5] + "|" + this.fields[6] + this.fields[7] + this.fields[8];
        var colonne = this.fields[0] + this.fields[3] + this.fields[6] + "|" + this.fields[1] + this.fields[4] + this.fields[7] + "|" + this.fields[2] + this.fields[5] + this.fields[8];
        var diagonale = this.fields[0] + this.fields[4] + this.fields[8] + "|" + this.fields[2] + this.fields[4] + this.fields[6];
        //check x win
        if ((ligne + colonne + diagonale).indexOf("XXX") != -1) {
            this.winner = "X";
            return true;
        }
        else if ((ligne + colonne + diagonale).indexOf("OOO") != -1) {
            this.winner = "O";
            return true;
        }
        return all;
    },
    currentPlayer: function() {
        return this.curPlayer;
    },
    otherPlayer: function() {
        if (this.curPlayer == "X") {
            return "O";
        }
        else {
            return "X";
        }
    },
    getFirstPositionAvailable: function() {
        return this.fields.indexOf('_') + 1;
    }
}
