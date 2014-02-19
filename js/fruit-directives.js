fruitTree.directive("nest", function($compile) {
    return {
        restrict: "E",
        templateUrl: 'nest.html',
        scope: {
            sel: '=',
            rate: '=',
            types: '=',
            proto: '=',
            address: '=',
            num:'='
        },
        controller: function($scope) {
            $scope.next='';
            $scope.numb = $scope.num +1;
            console.log($scope.num);
            $scope.getColor = function (order) {if (order) { return order.substring(0, 1);} else return 0};
        },
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



fruitTree.directive("saypanel", function($compile) {
    return {
        restrict: "E",
        templateUrl: 'saypanel.html',
        scope: {
            stem: '=',
            types: '=',
            proto: '=',
            parent: '='
        },
        controller: function ($scope) {

            $scope.pretaken='';
            $scope.say = function (stem, order, type, picLink, text) {
                var place = stem.availableOrders.indexOf(order);
                if (place >= 0) {
                    var time = new Date();
                    var date = time.toJSON();
                    if (!stem.branches) {stem.branches = []}
                    stem.branches.push(new $scope.proto(order, type, picLink, text, date));
                    stem.availableOrders.splice(place, 1);
                    $scope.pretaken = '';
                    $scope.pretake='';
                    $scope.sayingType='';
                    $scope.picLink='';
                    $scope.hidden=true;
                    $scope.shuffleOrders(stem);
                    $scope.linkedText = '';   //view repair
                    if (stem.availableOrders.length == 0) {
                        $scope.refillOrders(stem)
                    }
                    return true;
                }
                return false;
            };
            $scope.refillOrders = function (stem) {
                var current, result = baseLetters.concat(), order;

                for (var b = 0; b < stem.bit; b++) {
                    current = result.slice(0);
                    order = 0;
                    for (var i = 0; i < current.length; i++) {

                        for (var j = 0; j < 12; j++) {

                            result[order++] = current[i] + baseLetters[j];
                        }
                    }
                }
                stem.bit++;
                stem.availableOrders = result;
                $scope.shuffleOrders(stem);
            };
            $scope.getColor = function (order) {if (order) { return order.substring(0, 1);} else return 0};
            $scope.returnOrder = function (stem) {
                if ($scope.pretaken != '') {
                    $scope.pretaken = '';
                    $scope.shuffleOrders(stem);
                }
            };
            $scope.pretakeOrder = function (stem, order) {
                $scope.pretaken = order;
                $scope.shuffleOrders(stem);
            };
            $scope.shuffleOrders = function (stem) {
                stem.freeOrders = shuffle(stem.availableOrders);
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
        },
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

fruitTree.directive("roll", function($compile) {
    return {
        restrict: "E",
        templateUrl: 'roll.html',
        scope: {
            parent: '@',
            tape: '=',
            rate: '=',
            select: '='
        },
        controller: function($scope) {
            var boxWidth = 180;
            var retina = window.devicePixelRatio > 1;
            if (retina) {
                boxWidth = 360
            }

            $scope.cols='4';
            $scope.colsmax='5';
            var init=true;
            $scope.columner = function () {
                var element = document.getElementById($scope.parent) || document.body;
                $scope.width = element.clientWidth;
                $scope.colsmax = Math.floor($scope.width / boxWidth);
                if ($scope.cols > $scope.colsmax || init) {$scope.cols = $scope.colsmax; init=false};
                $scope.boxWidth = $scope.width/$scope.cols -5 +'px';
            };
            window.onresize = $scope.columner;
            $scope.selector = function (card) {
                if ($scope.select =='') {
                $scope.select = card
                } else {$scope.select = ''}
                if (card.select == '') {card.select='color-'+$scope.getColor(card.order)} else {card.select =''}
            };
            $scope.getColor = function (order) {if (order) { return order.substring(0, 1);} else return 0};
        },
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


