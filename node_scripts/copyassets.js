const fse = require('fs-extra');

const folders = ['xml', 'data', 'tiles', 'fonts', 'json', 'img', 'photos', 'php', 'html', 'index.html', 'index.php'];

fse.ensureDirSync('../dist/js');

folders.forEach(folder => {
    if (fse.pathExistsSync('../src/' + folder)) {
        console.log('Copying assets from:', '../src/' + folder);
        fse.copySync('../src/' + folder, '../dist/' + folder);
    }
});