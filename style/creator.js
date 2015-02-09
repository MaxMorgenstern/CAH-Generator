//<![CDATA[
var TextQueue = [];
var FileContent = "";
var FileName = "";
var CardColor = "";
var OutputName = "";
var StartDate = new Date();

window.onload=function(){
	
	// POPULATE TEXT
	function wrapText(context, text, x, y, maxWidth, lineHeight) {
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		context.fillText(line, x, y);
	}

	// BUILD CANVAS
	function buildCanvas(mytext, myfile) {
		var canvas = document.getElementById('myCanvas');
		var context = canvas.getContext('2d');
		var canvasWidth = 3288;
		var canvasHeight = 4488;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		var maxWidth = 2400;
		var fontSize = 249;
		var lineHeight = Math.round(fontSize * 1.2);
		var x = (canvasWidth - maxWidth) / 2;
		var y = 690;
		var lengthWarning = 175;
		var text = mytext;
		var textColor = '#000000';
		var cardBackImage = 'white';

		if(text.length > lengthWarning) {
			log("Text might be too long: "+text);
		}

		if(text.length > 0) {
			if (CardColor == "black") {
				textColor = '#ffffff';
				cardBackImage = 'black' + pickCardType(text);
			}

			if (CardColor == "test") {
				textColor = '#ff0000';
				cardBackImage = 'card-template-transcard';
			}

			text = createPlaceholder(textClean(text));

			context.font = "bold "+fontSize+"px 'Helvetica Neue'";
			context.fillStyle = textColor;
			context.ineCap = "round";

			var backg = new Image();
			backg.src = "./img/"+cardBackImage+".png";

			backg.onload = function() {
				context.drawImage(backg, 0, 0);
				wrapText(context, text, x, y, maxWidth, lineHeight);
				var canvasData = canvas.toDataURL("image/png");

				$.ajax({
					type: "POST",
					url: "imageCreator.php",
					data: { data: canvasData, filename: myfile }
				})
				.done(function( msg ) {
					log( "Data Saved: " + msg + ".png" );
					triggerNext();
				});
			};
		} else {
			log( "No Data found. Skip.");
			triggerNext();
		}
	}

	function textClean(str)
	{
		str = str.replace ('\“', '\"');
		str = str.replace ('\”', '\"');
		str = str.replace ('\’', '\'');
		str = str.replace ('[[2]]', '');
		str = str.replace ('[[3]]', '');
		str = str.replace ('[[G]]', '');
		str = str.replace ('[[g]]', '');
		str = str.trim();
		return str;
	}

	function pickCardType(str)
	{
		var mechanic = "-mechanic-";
		if(str.match(/[[2]]/gi)){ return mechanic+"p2"; }
		if(str.match(/[[3]]/gi)){ return mechanic+"d2p3"; }
		if(str.match(/[[G]]/gi)){ return mechanic+"gears"; }
		
		try {
			var blanks = str.match(/_+/gi).length;
			if (blanks == 2 ) {return mechanic+"p2"; }
			if (blanks == 3 ) {return mechanic+"d2p3"; }
		} catch (e) {
			console.log(e);
		}
		return "";
	}

	function createPlaceholder(str)
	{
		str = str.replace (/_+/gi, '______');
		return str;
	}
	
	// TRIGGER NEXT
	function triggerNext()
	{
		if(TextQueue.length > 0)
		{
			var allItems = FileContent.length;
			var todoItems = TextQueue.length;
			var doneItems = allItems-todoItems;
			/*
			var spent = new Date()-StartDate;
			var secondsestimate = (spent/doneItems*todoItems)/1000;
			console.log(secondsestimate + " Seconds to go!");
			*/
			document.getElementById('progressbar').value = Math.floor(100/allItems*doneItems);
			
			var i = TextQueue.pop();
			buildCanvas(i.txt, i.file);
		} else {
			document.getElementById('progressbar').value = 100;
			log("Done!");
		}
	}

	// READ FILE
	function readTextFile(file)
	{
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", file, false);
		rawFile.onreadystatechange = function ()
		{
			if(rawFile.readyState === 4)
			{
				if(rawFile.status === 200 || rawFile.status === 0)
				{
					var rfd = rawFile.responseText;
					FileContent = rfd.split("\n");
				}
			}
		};
		rawFile.send(null);
	}

	function log(text){
		$('#consolearea').append(text + "\n");
		$('#consolearea').scrollTop($('#consolearea')[0].scrollHeight - $('#consolearea').height());
	}

	// ###################

	document.getElementById("saveForm").onclick = function () {
		FileName = $( "#element_1" ).val();
		CardColor = $( "#element_3" ).val();
		OutputName = $( "#element_2" ).val();

		$( "#progressbar" ).value = 0;

		StartDate = new Date();
		log("Card creation started... \n" + StartDate);

		// read file
		if(FileName != "" && FileContent == ""){
			readTextFile(FileName);
			log("We read: " + FileContent.length + " Lines");
		} else {
			log("Uploaded file has: " + FileContent.length + " Lines");
		}
		// populate queue
		var fileLine = 0;
		FileContent.forEach(function(line) {
			var tmpItm = { txt: line, file: OutputName+"_"+fileLine };
			TextQueue.push(tmpItm);
			fileLine++;
		});
		
		$("#consolelog").show();

		buildCanvas("Thanks for using my\n'Cards Against Humanity' Card Generator.\n - Max\n  www.porzelt.net", "_1 README");

		return false;
	};
};//]]>

function fileSelected() {
	var input = document.getElementById('element_1_upload');
	
    // Create a reader object
    var reader = new FileReader();
    if (input.files.length) {
        var textFile = input.files[0];
        reader.readAsText(textFile);
        $(reader).on('load', processFile);
    } else {
		alert('Please upload a file before continuing');
	}
}

function processFile(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
        FileContent = file.split("\n");
		console.log("File Uploaded: " + FileContent.length + " lines.");
    }
}
