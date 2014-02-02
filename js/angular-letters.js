/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'akoenig.deckgrid']);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];

    var fruit = document.getElementById('fruit');
    columner();
    function columner () {
        $scope.width=fruit.clientWidth;
        $scope.colsmax=Math.floor($scope.width/160);
        $scope.cols = $scope.colsmax;
        $scope.$apply();
    }

    window.onresize = columner;

    $scope.makeColumns = function (obj, cols) {
        var i, col;
        for (i=0;i<obj.sayings.length;i++) {

        }
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
    function Order (order, text) {
        var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
        var ordr = this,
            bit = 1,
            pluses=0, zeros=0, minuses=0;
        var refillOrders = function () {
            var current, result=baseLetters.concat(), order;

            for (var b=0;b<bit; b++) {
                current = result.slice(0);
                order=0;
                for (var i=0; i<current.length;i++) {

                    for (var j=0;j<12;j++) {

                        result[order++]=current[i]+baseLetters[j];
                    }
                }
            }
            bit++;
            ordr.availableOrders = result;
            ordr.shuffleOrders();
        };
        ordr.order = order || '0';
        ordr.text = text || '';
        ordr.sayings = [];
        ordr.availableOrders = baseLetters.concat();
        ordr.pretakenOrders = [];
        ordr.freeOrders = shuffle(ordr.availableOrders);
        ordr.shuffleOrders = function () {
            ordr.freeOrders = shuffle(ordr.availableOrders);
        };
        ordr.pretakeOrder = function (order) {
            var place = availableOrders.indexOf(order);
               if (place>=0){
                    var time = new Date();
                    availableOrders.splice(place,1);
                    ordr.pretakenOrders.push({order:order, time:time});
                    return {order:order, time:time}
               }
            return false;
        };
        ordr.returnOrder = function (order) {
            var place = ordr.pretakenOrders.indexOf(order);
            if (place>=0){
                ordr.pretakenOrders.splice(place,1);
                availableOrders.push(order);
            }
        };
        ordr.say = function (order, text) {
            var place = ordr.availableOrders.indexOf(order);
            if (place>=0) {
                var time = new Date();
                ordr.sayings.push({order:order, date:time.toLocaleDateString(), time:time.toLocaleTimeString(),  text:text});
                ordr[order]=new Order(order,text);
                ordr.availableOrders.splice(place,1);
                ordr.shuffleOrders();
                $scope.linkedText = '';   //view repair
                if (ordr.availableOrders.length == 0) {refillOrders()}
                return true;
            }
            return false;
        };
        ordr.rate = function (sign) {
            switch (sign) {
                case '+':
                    pluses++;
                    break;
                case '0':
                    zeros++;
                    break;
                case '-':
                    minuses++;
                    break;
                default:
                    zeros++;
            }
        };
        ordr.getRating = function () {
            return pluses - minuses;
        };
        ordr.getTotal = function () {
            return pluses + minuses + zeros;
        };
        ordr.ratingSort = function (card) {
            var order = card.order;
            return -ordr[order].getRating();
        }
        ordr.exportSayings = function () {
            var result = {},i;
            result.order=ordr.order;
            result.text=ordr.text;
            result.pretakenOrders=ordr.pretakenOrders;
            result.bit=ordr.bit;
            result.sayings=ordr.sayings;
            result.pluses=pluses;
            result.minuses=minuses;
            result.zeros=zeros;
            result.availableOrders=ordr.availableOrders;
            for (i=0;i<ordr.sayings.length;i++) {
                result[ordr.sayings[i].order]=ordr[ordr.sayings[i].order].exportSayings();
            }
            return result;
        };
        ordr.importSayings = function (obj) {
            ordr.order=obj.order || '0';
            ordr.text=obj.text || '';
            ordr.pretakenOrders=obj.pretakenOrders || [];
            bit=obj.bit || 1;
            ordr.sayings=obj.sayings || [];
            pluses=obj.pluses || 0;
            minuses=obj.minuses || 0;
            zeros=obj.zeros || 0;
            ordr.availableOrders=obj.availableOrders;
            for (var i=0;i<ordr.sayings.length;i++) {
                ordr[ordr.sayings[i].order] = new Order;
                ordr[ordr.sayings[i].order].importSayings(obj[obj.sayings[i].order]);
            }

        }
    }



    $scope.root = new Order();
    $scope.getColor = function (order) {
        return order.substring(0,1);
    };
    $scope.reset = function () {
        $scope.root = new Order();
    };


$scope.firebase = $firebase(new Firebase('https://frukt.firebaseio.com')); //creating a firebase object
$scope.firebase.$bind($scope, "remote"); //bind a $scope.remoteLetters object for saving

$scope.saveToFireBase = function () {
 $scope.remote.root = $scope.root.exportSayings();
};
$scope.loadFromFireBase = function () {
$scope.root=new Order();
$scope.root.importSayings($scope.remote.root);
    $scope.root.shuffleOrders();
 };

$scope.types=['Затея','Событие','Личность','Оценка','Высказывание','Навык','Штука','Задача','Поставка'];
 /*  $scope.loadFromLocalStorage = function () {
       if (localStorage.length > 0) {
       $scope.currentLetters=JSON.parse(localStorage["currentLetters"]);
       $scope.sayings=JSON.parse(localStorage["sayings"]);
       $scope.bit=localStorage["bit"];
       $scope.colors=JSON.parse(localStorage["colors"]);
       $scope.rating=JSON.parse(localStorage["rating"]);
       $scope.shuffleLetters();
       }
    };


    $scope.saveToLocalStorage = function () {
        localStorage["sayings"] = JSON.stringify($scope.sayings);
        localStorage["currentLetters"] = JSON.stringify($scope.currentLetters);
        localStorage["bit"] = $scope.bit;
        localStorage["colors"] = JSON.stringify($scope.colors);
        localStorage["rating"] = JSON.stringify($scope.rating);
    };
*/



};

