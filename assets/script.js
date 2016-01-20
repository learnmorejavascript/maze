"use strict";

var map = [];
var w = 14;
var h = 14; 
var data ='';
var active = [];
var walls = [];
var cells = [];
var finished = false;

var start = '0,7';
var finish = '14,7';

var doReturn = false;
var doRun = false;

var ran = false;

var mouseDown = false; 
document.body.onmousedown = function() {
  mouseDown=true;
}
document.body.onmouseup = function() {
  mouseDown=false; 
  mouseOver = '';
}

document.body.onmouseleave = function() {
  mouseDown=false; 
  mouseOver = '';
}

var e = function(el) {
  return document.getElementById(el);
}

String.prototype.x = function() {
  var string = this.split(',');
  return parseInt(string[0]);
}
String.prototype.y = function() {
  var string = this.split(',');
  return parseInt(string[1]);
}
    
var write = true;
var button = function(type) {
  if (type=='empty') {
    walls=[];
    refreshTable();
  } else if (type=='write') {
    write = true;
    e('write').style.border = "2px solid #999";
    e('erase').style.border = "";
  } else if (type=='erase') {
    write = false;
    e('erase').style.border = "2px solid #999";
    e('write').style.border = "";
  }
}
    
var draw = function(id, img, rotation) {
  e(id).style.backgroundImage = "url(\"assets/images/"+img+"\")";
  e(id).style.transform ="rotate("+rotation+"deg)";
}

var mouseOver = '';
var move = '';
var addWall = function(wall, clicked) {
  if (clicked) {
    if (move=='') {
      if (wall===start) {
        move = 'start';
      } else if (wall===finish) {
        move = 'finish';
        finish = wall;
      }
    } else {
      move='';
      wall[start] = false;
      wall[finish] = false;
    }
  }
  
  var tile;
  if (move == 'start') {
    var oldstart = start;
    start = wall;
    tile = drawTile(oldstart);
    draw(oldstart, tile.img);
    draw(start, 'start.png');
  } else if (move == 'finish') {
    var oldfinish = finish;
    finish = wall;
    tile = drawTile(oldfinish);
    draw(oldfinish, tile.img);
    draw(finish, 'finish.png');
  }

  if ((mouseDown || clicked) && mouseOver!=wall && wall!=start && wall!=finish) {
    mouseOver = wall;

    walls[wall] = write;
      
    for (var x=-1;x<=1;x+=1) {//refresh the place that is being drawed, as well as the area around it.
      for (var y=-1;y<=1;y+=1) {
        var dx = wall.x()+x;
        var dy = wall.y()+y;
        var qwall = dx+","+dy;
          
        if (dx>=0 && dy>=0 && dx<=w && dy<=h) {
          var a_wall = drawTile(qwall);
          
          draw(qwall, a_wall.img, a_wall.rotate);
        }
      }
    }
  }
  
  if (ran && clicked) {
    refreshTable();
	ran = false;
  }
}

var generateTable = function() {
  var data = '';  
  for(var y=0;y<=w;y+=1) {
    data += '<tr>';
    for(var x=0;x<=h;x+=1) {
      var id = x+","+y;

      data += "<td id='"+id+"' onmousedown=\"addWall('"+id+"', 1)\" onmouseover=\"addWall('"+id+"')\" class='tile'></td>";
    }
    data += '</tr>';
  }
  e('map-table').innerHTML = data;
  
  refreshTable();
}

var refreshTable = function() {
  e('runner').style.display = 'none';
  e('runner').style.top = '-100px';
  e('runner').style.left = '-100px';
  
  clearInterval(runInterval);
  for(var y=0;y<=w;y+=1) {
    for(var x=0;x<=h;x+=1) {
      var id = x+','+y;
      var tile = drawTile(id);
      draw(id, tile.img, tile.rotate);
    }
  }
}

var drawTile = function(tile) {
  var img = 'white.png';
  var rotate = '';

  if (tile==start) {
    img='start.png';
  } else if (tile==finish) {
    img='finish.png';
  } else if (walls[tile]) {
    var thistile = tile.split(',');
    rotate = 0;

    var r=walls[(tile.x()+1)+","+(tile.y())];//right
    var l=walls[(tile.x()-1)+","+(tile.y())];//left
    var u=walls[(tile.x())+","+(tile.y()-1)];//up
    var d=walls[(tile.x())+","+(tile.y()+1)];//down

    var ul=walls[(tile.x()-1)+","+(tile.y()-1)];
    var ur=walls[(tile.x()+1)+","+(tile.y()-1)];
    var dl=walls[(tile.x()-1)+","+(tile.y()+1)];
    var dr=walls[(tile.x()+1)+","+(tile.y()+1)];

    var a = [r, l, u, d];

    var cnks = 0;//connections
    var type = '';//s: straight, b:bend

    for (var n=0;n<a.length;n+=1) {
      if (a[n] == 1) {
        cnks+=1;
      }
    }

    if (cnks == 0 && (tile.y()==0 || tile.y()==h || tile.x()==0 || tile.x()==w)) {
      cnks=1;
      if (tile.x()==w) {
        rotate=90;
      } else if (tile.y()==h) {
        rotate=180;
      } else if (tile.x()==0) {
        rotate=270;
      }
    } else if (cnks == 1) {
      if (r) {
        rotate=90;
      } else if (d) {
        rotate=180;
      } else if (l) {
        rotate=270;
      }

      if ((tile.y()==0 && d) || (tile.y()==h && u)) {
        cnks=2;
        type='s';
      }

      if ((tile.x()==0 && r) || (tile.x()==w && l)) {
        cnks=2;
        type='s';
        rotate=90;
      }
    } else if (cnks==2) {
      if ((r && l) || (u && d)) {
        type='s';
        if (r && l) {
          rotate=90;
        }
      } else {
        type='b';
        if (r && d) {
          rotate=90;
        } else if (l && d) {
          rotate=180;
        } else if (u && l) {
          rotate=270;
        }
      }
    } else if (cnks==3) {
      if (r && d && l) {
        rotate=90;
      } else if (l && d && u) {
        rotate=180;
      } else if (u && l && r) {
        rotate=270;
      }
    }

    img = 'w'+cnks+type+".png";
  }
  
  return {'img':img, 'rotate':rotate};
}

var solve = function() {
  if (doReturn!=true) {
    refreshTable();
  }
  active = [];
  cells = [];
  finished = false;
  generatePlus(start);
}

var generatePlus = function(id) {
  var x = id.x();
  var y = id.y();
  
  var drecs = [];
  drecs[0] = (x)+','+(y-1);//up
  drecs[1] = (x)+','+(y+1);//down
  drecs[2] = (x+1)+','+(y);//right
  drecs[3] = (x-1)+','+(y);//left
        
  if (x>-1 && y>-1 && x<=w && y<=h && finished!=true && active[id]!=1 && walls[id]!=true) {
    
  active[id]=1;
    
  if (id==finish) {
    if (doReturn) {
      doRun = true;
      finished=true;
    } else {
      runner(cells[id]);
      finished=true;
    }
    } else {
      setTimeout(function() {
        for (var n=0;drecs[n];n+=1) {
          if (active[drecs[n]]!=1) {
            if (id==start) {
              cells[drecs[n]] = id+"|"+drecs[n];
            } else {
              cells[drecs[n]] = cells[id]+"|"+drecs[n];
            }
              
            generatePlus(drecs[n]);
          }
        }
      }, 0);
    }
  }
}

var runInterval = '';
var runner = function(drecs) {
  ran = true;
  drecs = drecs.split('|');
  var drecsNum = 0;
  var picnum=1;
  
  var dsx=start.x()*30;
  var dsy=start.y()*30;
  var x = start.x();
  var y = start.y();
  
  var trail = [];
  for (var n=0;drecs[n];n+=1) {
    trail[drecs[n]] = 1;
  }
  
  var mapTable = e("map-table");
  var offset = { top: mapTable.offsetTop, left: mapTable.offsetLeft };
  
  var offsety = offset.top;
  var offsetx = offset.left;
  
  function run() {
    var x = drecs[drecsNum].x();
    var y = drecs[drecsNum].y();

    var dx = x*30;
    var dy = y*30;

    var r = trail[(x+1)+','+(y)];
    var l = trail[(x-1)+','+(y)];
    var u = trail[(x)+','+(y-1)];
    var d = trail[(x)+','+(y+1)];
      
    var rotate = 0;
    var img = '';
      
    var ring=dx>dsx;
    var ling=dx<dsx;
    var uing=dy<dsy;
    var ding=dy>dsy;

    if (ring) {
      dsx+=5;
    }

    if (ling) {
      dsx-=5;
    }

    if (uing) {
      dsy-=5;
    }

    if (ding) {
      dsy+=5;
    } 

    img = 'ts';

    if (u && r) {
    img = 'tb';
    } else if (r && d) {
    img = 'tb';
    rotate = 90;
    } else if (l && d) {
    img = 'tb';
    rotate = 180;
    } else if (u && l) {
    img = 'tb';
    rotate = 270;
    } else if (r || l) {
    rotate = 90;
    }

    var ext = '';
    if (start==drecs[drecsNum]) {
      ext = 'start';
    } else if (finish==drecs[drecsNum]) {
      ext = 'finish';
    }

    if (start==drecs[drecsNum] || finish==drecs[drecsNum]) {
      if (r) {
        rotate = 90;
      } else if (d) {
        rotate = 180;
      } else if (l) {
        rotate = 270;
      }
    }

    if (dx==dsx && dy==dsy) {
      draw(drecs[drecsNum], img+ext+'.png', rotate);
      drecsNum+=1;
    }
        
    e('runner').style.top = (dsy+offsety+1)+"px";
    e('runner').style.left = (dsx+offsetx/*+1*/)+"px";

    picnum+=1;
    if (picnum>8) {
    picnum=1;
    }

    if (drecs[drecsNum]==undefined) {
      clearInterval(runInterval);
      e('runner').style.display = "none";
    }
  }

  runInterval = setInterval(run, 25); //25 or 20 or 50
  e('runner').style.display = '';
}

var generateMaze = function() {
  start = '1,'+(1+Math.floor(Math.random()*7)*2);
  finish = '13,'+(1+Math.floor(Math.random()*7)*2);
  
  doReturn = true;
  doRun = false;

  function runTest() {  
    setTimeout(function() {
      if (doRun) {
        doReturn = false;
        doRun = false;
        
        solve();
      } else {
        walls = [];

        for (var x=0;x<=w;x+=2) {
          for (var y=0;y<=h;y+=2) {
            walls[x+','+y] = true;
                
            var r = Math.floor(Math.random()*4);

            if (r==0) {
              walls[(x+1)+','+y] = true;
              walls[(x+2)+','+y] = true;
            } else if (r==1) {
              walls[(x-1)+','+y] = true;
              walls[(x-2)+','+y] = true;
            } else if (r==2) {
              walls[x+','+(y+1)] = true;
              walls[x+','+(y+2)] = true;
            } else if (r==3) {
              walls[x+','+(y-1)] = true;
              walls[x+','+(y-2)] = true;
            }
          }
        }
        
        solve();
        
        setTimeout(function() {
          runTest();
        }, 100);
      }
    }, 50);
  }
  
  runTest();
}

generateTable();