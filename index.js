const ws281x = require('rpi-ws281x-native');

const express = require('express');
const app = express();

var NUM_LEDS = parseInt(process.argv[2], 10) || 6,
    pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);


app.get('/', (req, res) => res.send('Hello World!'))


app.post('/test', function(req, res, next) {
//    console.log(req.body);
//    console.log("data we got = ", req.rawBody);

    height = 2;
    width = 3;
    data = "[182,23,234][172,23,234][12,263,234]" +
           "[2,3,34][1,2,24][62,43,284]";
    parsed_light = read_led_data(height,width,data);

    ws281x.render(pixelData);

    res.json(parsed_light);
});

function read_led_data(height, width, data){
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

            //console.log(curr_light,i,j);
            //retval.push(curr_light);
            //Update the LEd Value
        }
    }

    return retval;
}

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}



app.listen(3101, () => console.log('Example app listening on port 3101!'))
