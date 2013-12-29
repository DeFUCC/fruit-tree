/**
 * Created by starov on 26.12.13.
 */


function LettersCtrl($scope) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    $scope.bit = 1;
    $scope.currentLetters = baseLetters.concat();
    $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
    $scope.myLetters = [];

    $scope.takeLetter = function(letter) {
        var place = $scope.currentLetters.indexOf(letter);
        if (place >= 0) {
            $scope.myLetters.push({letter: letter, text: $scope.linkedText});
            $scope.currentLetters.splice(place,1);
            $scope.linkedText = '';
            $scope.saveToLocalStorage();
            $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
        }
    };
    $scope.getButtonStatus = function (obj){
        if (obj.text) {return 'btn-success'} else {return 'btn-default'}
    };

    $scope.selectOrder = function (obj) {
        $scope.selectedOrder = obj;
    };

    $scope.storageStatus = function() { return localStorage.length};

    $scope.loadFromLocalStorage = function () {
       if (localStorage.length > 0) {
       $scope.currentLetters=JSON.parse(localStorage["currentLetters"]);
       $scope.myLetters=JSON.parse(localStorage["myLetters"]);
       $scope.bit=localStorage["bit"];
       $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
       }
    };

    $scope.restart = function(){
        localStorage.clear();
        $scope.bit = 1;
        $scope.currentLetters = baseLetters.concat();
        $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
        $scope.myLetters = [];
    };

    $scope.saveToLocalStorage = function () {
            localStorage["myLetters"] = JSON.stringify($scope.myLetters);
            localStorage["currentLetters"] = JSON.stringify($scope.currentLetters);
            localStorage["bit"] = $scope.bit;
    };

    $scope.refillLetters = function () {
        var current, result=baseLetters.concat(), order;

        for (var b=0;b<$scope.bit; b++) {
            current = result.slice(0);
            order=0;
            for (var i=0; i<current.length;i++) {

                for (var j=0;j<12;j++) {

                    result[order++]=current[i]+baseLetters[j];
                }
            }
        }
        $scope.bit++;
        $scope.currentLetters = result;
        $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
    };

    $scope.focus = function () {document.getElementById('usertext').focus()};

    function shuffle(massive) {
        arr = massive.concat();
        for (var i = arr.length - 1; i > 0; i--) {
            var num = Math.floor(Math.random() * (i + 1));
            var d = arr[num];
            arr[num] = arr[i];
            arr[i] = d;
        }

        return arr;
    }


}

