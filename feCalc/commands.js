$(document).ready(function() {

	var calcChances = function(p1, p2) {
  	var rngType = $('input[name=r_truehit]:checked', '#dmgForm').val();
  	var truehit;
  	if (rngType === "truehit") {
  		truehit = 'truehit';
  	} else if (rngType === "fates_hit") {
  		truehit = 'fates_hit';
  	} else {
  		truehit = 'none';
  	}

  	$.getScript('dmgCalc.js', function()
	{
		var totalAttack = DmgFunc.computeTable_simple(p1, p2, truehit);

	    var tableBody = $('#t-body');
	    $('#t-body').html("");

	    for (var i = 0; i < totalAttack.length; i++) {
    		var chanceSlot = totalAttack[i];
	    	var tableHtml = "<tr>";

	    	if (p1.type === 'enemy') {
	    		tableHtml += "<td>";	
	    		tableHtml += String(chanceSlot['damageReceived']);
	    		tableHtml += "</td>";

	    		tableHtml += "<td>";
	    		tableHtml += String(chanceSlot['damage']);
	    		tableHtml += "</td>";
	    	} else {
	    		tableHtml += "<td>";
	    		tableHtml += String(chanceSlot['damage']);
	    		tableHtml += "</td>";

	    		tableHtml += "<td>";	
	    		tableHtml += String(chanceSlot['damageReceived']);
	    		tableHtml += "</td>";
	    	}
    		

    		tableHtml += "<td>";	
    		tableHtml += String(chanceSlot['chance'].toString());
    		tableHtml += "</td>";

	    	tableHtml += "</tr>";
	    	tableBody.append(tableHtml);
	    }

	});

  };
  $('#calc').click(function() {
  	var player = {
  		type:'player',
  		hp: parseInt($('#p1HP').val()),
  		speed: parseInt($('#p1Speed').val()),
  		brave: $('#p1Brave').prop("checked"),
  		hit: parseInt($('#p1Hit').val()),
  		damage: parseInt($('#p1Dmg').val()),
  		crit: parseInt($('#p1Crit').val())
  	};
  	var enemy = {
  		type:'enemy',
  		hp: parseInt($('#p2HP').val()),
  		speed: parseInt($('#p2Speed').val()),
  		brave: $('#p2Brave').prop("checked"),
  		hit: parseInt($('#p2Hit').val()),
  		damage: parseInt($('#p2Dmg').val()),
  		crit: parseInt($('#p2Crit').val())
  	};
  	calcChances(player, enemy);
  });
  $('#calc-enemy').click(function() {
  	var player = {
  		type:'player',
  		hp: parseInt($('#p1HP').val()),
  		speed: parseInt($('#p1Speed').val()),
  		brave: $('#p1Brave').prop("checked"),
  		hit: parseInt($('#p1Hit').val()),
  		damage: parseInt($('#p1Dmg').val()),
  		crit: parseInt($('#p1Crit').val())
  	};
  	var enemy = {
  		type:'enemy',
  		hp: parseInt($('#p2HP').val()),
  		speed: parseInt($('#p2Speed').val()),
  		brave: $('#p2Brave').prop("checked"),
  		hit: parseInt($('#p2Hit').val()),
  		damage: parseInt($('#p2Dmg').val()),
  		crit: parseInt($('#p2Crit').val())
  	};
  	calcChances(enemy, player);
  });
});
