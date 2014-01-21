/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'akoenig.deckgrid']);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];
    $scope.availableColors = baseColors.concat();
    $scope.bit = 1;
    $scope.currentLetters = baseLetters.concat();
    $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
    $scope.popLetter = $scope.showLetters.pop();
    $scope.myLetters = [];
    $scope.colors = [];
    $scope.fireLetters = $firebase(new Firebase('http://fruit-tree.firebaseio.com')); //creating a firebase object
    $scope.fireLetters.$bind($scope, "remoteLetters"); //bind a $scope.remoteLetters object for saving
    $scope.saveToFireBase = function () {
        var remote = $scope.remoteLetters;
        remote.myLetters = $scope.myLetters;
        remote.currentLetters = $scope.currentLetters;
        remote.bit = $scope.bit;
        remote.colors = $scope.colors;
    };
    $scope.loadFromFireBase = function () {
        var data = $scope.remoteLetters;
        $scope.myLetters = data.myLetters;
        $scope.currentLetters = data.currentLetters;
        $scope.bit = data.bit;
        $scope.colors = data.colors;
        $scope.shuffleLetters();
    };
    $scope.takeLetter = function(letter) {
        var place = $scope.currentLetters.indexOf(letter);
        if (place >= 0) {
            $scope.myLetters.push({letter: letter, text: $scope.linkedText});
            $scope.currentLetters.splice(place,1);
            $scope.linkedText = '';
            $scope.saveToLocalStorage();
            $scope.shuffleLetters();
        }
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
       $scope.colors=JSON.parse(localStorage["colors"]);
       $scope.shuffleLetters();
       }
    };

    $scope.restart = function(){
        localStorage.clear();
        $scope.bit = 1;
        $scope.currentLetters = baseLetters.concat();
        $scope.shuffleLetters();
        $scope.myLetters = [];
        $scope.colors = [];
        $scope.selectedOrder=false;
    };

    $scope.saveToLocalStorage = function () {
        localStorage["myLetters"] = JSON.stringify($scope.myLetters);
        localStorage["currentLetters"] = JSON.stringify($scope.currentLetters);
        localStorage["bit"] = $scope.bit;
        localStorage["colors"] = JSON.stringify($scope.colors);
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
        $scope.shuffleLetters();
    };

    $scope.shuffleLetters = function (){
        $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
        $scope.popLetter = $scope.showLetters.shift();
    };

    $scope.armColor = function(letter){
        for (var i=0; i<$scope.colors.length; i++) {
            if (letter == $scope.colors[i].letter) {
                return $scope.colors[i].color;
            }
        }
        console.log('works');
        var color = 'c';
        if ($scope.availableColors.length == 0) {$scope.availableColors = baseColors.concat();}
        color = $scope.availableColors.shift();
        $scope.colors.push({letter:letter, color:color});
        return color;
    };

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


};

