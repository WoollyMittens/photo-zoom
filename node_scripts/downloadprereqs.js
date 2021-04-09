const fs = require('fs');
const fetch = require('node-fetch');
const prereqs = require('../prereqs.json');

var queue = [];

for (var path in prereqs) {
    queue = queue.concat(prereqs[path]);
}

function download(queue) {
    var file = queue.pop();
    if (file) {
        console.log('Fetching:', path + file);
        fetch(path + file)
            .then(res => {
                if (res.ok) {
                    console.log('Saved as:', '../src/lib/' + file);
                    const dest = fs.createWriteStream('../src/lib/' + file);
                    res.body.pipe(dest);
                } else {
                    console.log('Failed:', res.statusText);
                }
                download(queue);
            });
    }
};

download(queue);
