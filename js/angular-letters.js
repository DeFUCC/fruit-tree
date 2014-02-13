/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'ui.bootstrap' /*, 'akoenig.deckgrid' */]);
var controllers = {};
fruitTree.controller(controllers);

/* A template for a recursive directory

fruitTree.directive("tree", function($compile) {
    return {
        restrict: "E",
        scope: {family: '='},
        template:
            '<p>{{ family.name }}</p>'+
                '<ul>' +
                '<li ng-repeat="child in family.children">' +
                '<tree family="child"></tree>' +
                '</li>' +
                '</ul>',
        compile: function(tElement, tAttr) {
            var contents = tElement.contents().remove();
            var compiledContents;
            return function(scope, iElement, iAttr) {
                if(!compiledContents) {
                    compiledContents = $compile(contents);
                }
                compiledContents(scope, function(clone, scope) {
                    iElement.append(clone);
                });
            };
        }
    };
});
*/

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];
    var boxWidth = 160;
    var retina = window.devicePixelRatio > 1;
    if (retina) {boxWidth=320};


    $scope.columner = function (el) {
        var fruit = document.getElementById('fruit');
        $scope.width=fruit.clientWidth;
        $scope.colsmax=Math.floor($scope.width/boxWidth);
        $scope.cols = $scope.colsmax;
        $scope.$apply();
    };

    window.onresize = $scope.columner;


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

    function Order (order, type, picLink, text, date) {
        var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
        this.pluses=0;
        this.zeros=0;
        this.minuses=0;
        this.date=date;
        this.order = order || '0';
        this.type = type || '';
        this.picLink = picLink || '';
        this.text = text || '';
        this.bit = 1;
        this.l={};
        this.availableOrders = baseLetters.concat();
        this.pretaken='';
        this.freeOrders = shuffle(this.availableOrders);
    }
Order.prototype.objToArray = function () {
    var i, arr=[];
    for (i in this.l) {
        arr.push(this.l[i]);
    }
    return arr;
};
Order.prototype.importSayings = function (obj) {
    this.order=obj.order || '0';
    this.type=obj.type || '';
    this.picLink=obj.picLink || '';
    this.text=obj.text || '';
    this.pretakenOrders=obj.pretakenOrders || [];
    this.bit=obj.bit || 1;
    this.l={};
    this.pluses=obj.pluses || 0;
    this.minuses=obj.minuses || 0;
    this.zeros=obj.zeros || 0;
    this.availableOrders=obj.availableOrders;
    this.shuffleOrders();
    for (var i in obj.l) {
        this.l[i] = new Order();
        this.l[i].importSayings(obj.l[i]);
    }

};
Order.prototype.exportSayings = function () {
        var result = {},i;
        result.order=this.order;
        result.type=this.type;
        result.picLink=this.picLink;
        result.text=this.text;
        result.pretakenOrders=this.pretakenOrders;
        result.bit=this.bit;
        result.l={};
        result.pluses=this.pluses;
        result.minuses=this.minuses;
        result.zeros=this.zeros;
        result.availableOrders=this.availableOrders;
        for (i in this.l) {
            result.l[i]=this.l[i].exportSayings();
        }
        return result;
    };
Order.prototype.ratingSort = function (card) {
    return $scope.root.l[card.order].minuses - $scope.root.l[card.order].pluses;
};
Order.prototype.getTotal = function () {
        return this.pluses + this.minuses + this.zeros;
    };
Order.prototype.getRating = function () {
    return this.pluses - this.minuses;
};
Order.prototype.shuffleOrders = function () {
        this.freeOrders = shuffle(this.availableOrders);
    };
Order.prototype.rate = function (sign) {
        switch (sign) {
            case '+':
                this.pluses++;
                break;
            case '0':
                this.zeros++;
                break;
            case '-':
                this.minuses++;
                break;
            default:
                this.zeros++;
        }
    };
Order.prototype.refillOrders = function () {
        var current, result=baseLetters.concat(), order;

        for (var b=0;b<this.bit; b++) {
            current = result.slice(0);
            order=0;
            for (var i=0; i<current.length;i++) {

                for (var j=0;j<12;j++) {

                    result[order++]=current[i]+baseLetters[j];
                }
            }
        }
        this.bit++;
        this.availableOrders = result;
        this.shuffleOrders();
    };
Order.prototype.say = function (order, type, picLink, text) {
    var place = this.availableOrders.indexOf(order);
    if (place>=0) {
        var time = new Date();
        var date = time.toJSON();
        this.l[order]= new Order (order,type,picLink,text, date);
        this.availableOrders.splice(place,1);
        this.pretaken='';
        this.shuffleOrders();
        $scope.linkedText = '';   //view repair
        if (this.availableOrders.length == 0) {this.refillOrders()};
        return true;
    }
    return false;
};
Order.prototype.returnOrder = function () {
    this.pretaken='';
    this.shuffleOrders();
};
Order.prototype.pretakeOrder = function (order) {
    this.pretaken = order;
    this.shuffleOrders();
    return order
};

    $scope.sort = function (card) {
        return card.minuses - card.pluses;
    };

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

