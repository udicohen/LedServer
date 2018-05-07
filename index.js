const ws281x = require('rpi-ws281x-native');

const express = require('express');
const app = express();
const bodyParser = require("body-parser");

ws281x.init(100);
ws281x.reset();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'))


app.post('/test', function(req, res, next) {

    console.log(req.body);
    height = req.body.height || 2;
    width = req.body.width || 3;
    data = req.body.data || "[182,23,234][172,23,234][12,263,234][234,33,34][100,232,24][162,43,284]";

    pixelData = read_led_data(height,width,data);

    res.json(pixelData);
});

function read_led_data(height, width, data){
    console.log('in read_led_data');

    var NUM_LEDS = height*width,
        pixelData = new Uint32Array(NUM_LEDS);
    ws281x.reset();
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

            console.log(rgb2Int(r,g,b),i,j);
            pixelData[j+i*width] = rgb2Int(r,g,b);

        }
    }
    console.log('pixelData=',pixelData);
    ws281x.render(pixelData);

    return pixelData
}

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}



app.listen(3101, () => console.log('Example app listening on port 3101!'))
