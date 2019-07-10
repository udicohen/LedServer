const ws281x = require('rpi-ws281x-native');

const express = require('express');
const app = express();
const bodyParser = require("body-parser");

//ws281x.init(100);
//ws281x.reset();

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', (req, res) => res.send('Hello World!'))


app.post('/test', function(req, res, next) {

    console.log(req.body);
    var height = req.body.height || 2;
    var width = req.body.width || 3;
    var data = req.body.data || "[182,23,234][172,23,234][12,263,234][234,33,34][100,232,24][162,43,284]";

    var pixelData = read_led_data(height,width,data);

    res.json(pixelData);
});

app.post('/translate_matrix_to_our_rgb_photo', function(req, res, next) {
    var matrix_string = req.body.matrix_string  ||  "     **     \n" +
                                                "     @@     \n" +
                                                "     ##     \n";
    console.log(matrix_string);
    var pixelData = translate_matrix_to_our_rgb_photo(matrix_string);
    res.json(pixelData);

});

app.post('/matrix_to_moving_matrix', function(req, res, next) {
    var matrix_string = req.body.matrix_string  ||  "     **          **          **          **          **          **          **     \n" +
                                                "     @@          @@          @@          @@          @@          @@          @@     \n" +
                                                "     ##          ##          ##          ##          ##          ##          ##     \n";
    console.log(matrix_string);
    var pixelData = matrix_to_moving_matrix(matrix_string);
    res.json(pixelData);

});

function read_led_data(height, width, data){
    console.log('in read_led_data');

    var NUM_LEDS = height*width,
        pixelData = new Uint32Array(NUM_LEDS);
    //ws281x.reset();
    ws281x.init(NUM_LEDS);

    console.log('NUM_LEDS=',NUM_LEDS);

    retval = [];
    data_array = data.split(']');
    for (var i=0;i<height;i++){
        for (var j=0;j<width;j++){
            curr_string = data_array[j+i*width];

            // light as [R,B,G]
            curr_light = curr_string.slice(1).split(',');

            var r =  parseInt(curr_light[0]);
            var g =  parseInt(curr_light[1]);
            var b =  parseInt(curr_light[2]);

            //console.log(rgb2Int(r,g,b),i,j);
            pixelData[j+i*width] = rgb2Int(r,g,b);

        }
    }
    ws281x.render(pixelData);

    return pixelData
}

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function translate_matrix_to_our_rgb_photo(matrix_string){
    console.log('in translate_matrix_to_our_rgb_photo');

    var width = matrix_string.indexOf('\n');
    var height = (matrix_string.split('\n').length) - 1;
    var matrix = matrix_string.replace(/\n|\r/g, "");


    var data = "";
    console.log('width=',width);
    console.log('height=',height);
    console.log('matrix_string=\n',matrix_string);

    var r = "[0,0,255]";
    var g = "[0,255,0]";
    var b = "[255,0,0]";

    for(var i=0;i<height;i++) {
        var curr_line = "";
        for (var j=0;j<width;j++) {
            char = matrix.charAt(i*width+j);
            rnd_num = getRandomInt(3);
            if (char == ' '){
                curr_rgb = "[0,0,0]"
            }else if(rnd_num == 0){
                curr_rgb = r
            }else if(rnd_num == 1){
                curr_rgb = g
            }else if(rnd_num == 2){
                curr_rgb = b
            }else{
                curr_rgb = g
            }

            if (i%2==0){
                curr_line = curr_rgb + curr_line;
            }else{
                curr_line += curr_rgb;
            }
        }

        data += curr_line;

        data += "[0,0,0]";
        if (i%2!=0){
            data += "[0,0,0]";
        }
    }

    var pading = "[0,0,0][0,0,0][0,0,0][0,0,0][0,0,0][0,0,0][0,0,0][0,0,0]";
    data = pading + data;


    //console.log('data=',data);
    pixelData = read_led_data(height,width,data);

    console.log('out translate_matrix_to_our_rgb_photo');
}

function matrix_to_moving_matrix(matrix_string) {
    console.log('in matrix_to_moving_matrix');

    var width = matrix_string.indexOf('\n');
    var height = (matrix_string.split('\n').length) - 1;
    var matrix = matrix_string.replace(/\n|\r/g, "");

    console.log('width=',width);
    console.log('height=',height);
    console.log('matrix=',matrix);

    var start_width_position = 0;
    var curr_width = 1;
    var max_width = 30;

    var stam_var = 5;
    for (var count=1; count<width; count++) {
        setTimeout(function (){
            stam_var++;
            var new_matrix = "";
            if(curr_width > max_width){
                start_width_position = curr_width - max_width;
            }
            for (var i = 0; i < height; i++) {
                for (var j = start_width_position; j < curr_width; j++) {
                    new_matrix += matrix.charAt(i * width + j);
                }
                new_matrix += '\n';
            }

            translate_matrix_to_our_rgb_photo(new_matrix);

            curr_width++;

            if (stam_var == width){
                matrix_to_moving_matrix(matrix_string);
            }

        }, count*100);
    }

    console.log('out matrix_to_moving_matrix');
}


app.listen(3101, () => console.log('Example app listening on port 3101!'))
