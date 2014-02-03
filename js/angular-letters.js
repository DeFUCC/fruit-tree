/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'ui.bootstrap' /*, 'akoenig.deckgrid' */]);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];

    var fruit = document.getElementById('fruit');
    $scope.columner = function () {
        $scope.width=fruit.clientWidth;
        $scope.colsmax=Math.floor($scope.width/160);
        $scope.cols = $scope.colsmax;
        $scope.$apply();
    };

    window.onresize = $scope.columner;

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
    function Order (order, type, picLink, text) {
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
        ordr.type = type || '';
        ordr.picLink = picLink || '';
        ordr.text = text || '';
        ordr.sayings = [];
        ordr.availableOrders = baseLetters.concat();
        ordr.pretaken='';
        ordr.freeOrders = shuffle(ordr.availableOrders);
        ordr.shuffleOrders = function () {
            ordr.freeOrders = shuffle(ordr.availableOrders);
        };
        ordr.pretakeOrder = function (order) {
                    ordr.pretaken = order;
                    ordr.shuffleOrders();
                    return order
        };
        ordr.returnOrder = function () {
            ordr.pretaken='';
        };
        ordr.say = function (order, type, picLink, text) {
            var place = ordr.availableOrders.indexOf(order);
            if (place>=0) {
                var time = new Date();
                ordr.sayings.push({order:order, type:type, picLink:picLink, date:time.toLocaleDateString(), time:time.toLocaleTimeString(),  text:text});
                ordr[order]=new Order(order,type,picLink,text);
                ordr.availableOrders.splice(place,1);
                ordr.pretaken='';
                ordr.shuffleOrders();
                $scope.linkedText = '';   //view repair
                if (ordr.availableOrders.length == 0) {refillOrders()};
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
        };
        ordr.exportSayings = function () {
            var result = {},i;
            result.order=ordr.order;
            result.type=ordr.type;
            result.picLink=ordr.picLink;
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
            ordr.type=obj.type || '';
            ordr.picLink=obj.picLink || '';
            ordr.text=obj.text || '';
            ordr.pretakenOrders=obj.pretakenOrders || [];
            bit=obj.bit || 1;
            ordr.sayings=obj.sayings || [];
            pluses=obj.pluses || 0;
            minuses=obj.minuses || 0;
            zeros=obj.zeros || 0;
            ordr.availableOrders=obj.availableOrders;
            for (var i=0;i<ordr.sayings.length;i++) {
                ordr[ordr.sayings[i].order] = new Order();
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

$scope.types=['Design','Event','Person','Saying'];

 /*   $scope.loadFromLocalStorage = function () {
       if (localStorage.length > 0) {
       $scope.root = new Order();
       $scope.root.importSayings(JSON.parse(localStorage["root"]));
       $scope.root.shuffleOrders();
       }
    };


    $scope.saveToLocalStorage = function () {
        localStorage["root"] = JSON.stringify($scope.root.exportSayings());
        console.log(localStorage['root']);
    };

*/


};

