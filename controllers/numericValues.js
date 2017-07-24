var fs = require('fs');
exports.getValues = function(req, res) {
    if (!req.query.min)
      res.status(500).send({ error: 'Missing url parameter min' });

    if (!req.query.max)
      res.status(500).send({ error: 'Missing url parameter max' });

    fs.access('data.json', (err) => {
  		if (!err) {
    		fs.readFile('data.json', 'utf8', (er, data) => {
				if (!err)
				{
					let min = parseInt(req.query.min);
					let max = parseInt(req.query.max);
					let obj = JSON.parse(data);
					let ret = [];
					let start = -1;

					if (min < 0)
					{
						console.warn("min < 0");
					}

					for (let i = 0; i < obj.length; i++)
					{
						if (obj[i].x == min)
						{
							start = i;
							break;
						}
					}

					if (start < 0 && min < 0)
					{
						start = 0;
						min = 0;
					}

					if (start >= 0)
					{
						for (let j = start; j < (start+max-min+1) && j < obj.length; j++)
							ret.push({x:obj[j].x, y:obj[j].y});
					}

					res.setHeader('Content-Type', 'application/json');
					res.send(ret);
				}
				else
					res.status(500).send({ error: 'Error reading data.json' });
			});
		}
		else
        	res.status(500).send({ error: 'Missing data.json' });
    });
}