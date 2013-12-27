/**
 * Created by starov on 26.12.13.
 */

function Letters (name) {
    this.name = name;
    var base = ['A','B','C','E','H','K','M','O','P','T','X','Y'],
        bit = 0,
        currentLetters = [];
    noEmptyBit();

    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var num = Math.floor(Math.random() * (i + 1));
            var d = arr[num];
            arr[num] = arr[i];
            arr[i] = d;
        }
        return arr;
    }

    function newBit (arr){
        var result=[], order=0;
        for (var i=0; i<arr.length;i++) {
            for (var j=0;j<12;j++) {
                result[order++]=arr[i]+base[j]
            }
        }
        return result;
    }

    function fullBit() {
        var result=base;
        for (var i=1;i<bit; i++) {
            result = newBit(result);
        }
        return result;
    }

    //something is wrong!
    //When the letters end, new ones do not appear as expected due to noEmpyBit()

    function noEmptyBit() {
        if (currentLetters.length == 0) {
            bit++;
            currentLetters=fullBit();
        }
    }



    var count = currentLetters.length;

    this.showCurrent = currentLetters;

    this.getLetters = function(amount) {
        if (typeof amount == 'number' && amount>0 && amount<=count-1) {
            return shuffle(currentLetters).slice(0,amount);
        } else return shuffle(currentLetters).slice(0,5);
    };

    this.autoPick = function () {
        var letters = shuffle(currentLetters).pop();
        noEmptyBit();
        this.pickLetters(letters);
        return letters;
    }

    this.pickLetters = function (letters) {
        noEmptyBit();
        var place = currentLetters.indexOf(letters);
        if (typeof letters == 'string' && letters.length == bit && place != -1) {
            var result = currentLetters.splice(place,1);
            return result;
        } else {return false}

    }


}

function Dar (order) {
    this.order=order;
}