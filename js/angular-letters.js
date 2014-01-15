/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase']);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    $scope.bit = 1;
    $scope.currentLetters = baseLetters.concat();
    $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
    $scope.popLetter = $scope.showLetters.pop();
    $scope.myLetters = [];
    $scope.fireLetters = $firebase(new Firebase('http://fruit-tree.firebaseio.com')); //creating a firebase object
    $scope.fireLetters.$bind($scope, "remoteLetters"); //bind a $scope.remoteLetters object for saving
    $scope.saveToFireBase = function () {
        var remote = $scope.remoteLetters;
        remote.myLetters = $scope.myLetters;
        remote.currentLetters = $scope.currentLetters;
        remote.bit = $scope.bit;
    };
    $scope.loadFromFireBase = function () {
        var data = $scope.remoteLetters;
        $scope.myLetters = data.myLetters;
        $scope.currentLetters = data.currentLetters;
        $scope.bit = data.bit;
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
    $scope.getButtonStatus = function (obj){
        if (obj.text) {return 'success'} else {return 'default'}
    };
    $scope.getLetterButtonStatus = function (){
        if ($scope.linkedText) {return ''} else {return 'disabled="disabled"'}
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
       $scope.shuffleLetters();
       }
    };

    $scope.restart = function(){
        localStorage.clear();
        $scope.bit = 1;
        $scope.currentLetters = baseLetters.concat();
        $scope.shuffleLetters();
        $scope.myLetters = [];
        $scope.selectedOrder=false;
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
        $scope.shuffleLetters();
    };

    $scope.shuffleLetters = function (){

        $scope.showLetters = shuffle($scope.currentLetters).slice(0,12);
        $scope.popLetter = $scope.showLetters.shift();
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

