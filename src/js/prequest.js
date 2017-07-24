class PAjaxRequest
{
    constructor(options)
    {
        this.xhr = null;
        this.opt = options;
        this.aborted = false;
    }

    Send(data)
    {
        let prH = new Promise((resolve, reject) => {

            this.xhr = new XMLHttpRequest();

            if (this.opt.nocache == true)
            {
                //append random value to change url, no browser cache
                if (this.opt.url.indexOf('?') > -1)
                    this.opt.url += "&rndm=" + Math.random();
                else
                    this.opt.url += "?rndm=" + Math.random();
            }

            this.xhr.open(this.opt.method, this.opt.url, true);

            if (this.opt.timeout)
            {
                this.xhr.timeout = this.opt.timeout;
                this.xhr.ontimeout = () => {
                    reject({
                        status: this.xhr.status,
                        statusText: this.xhr.statusText
                    });
                };
            }
                
            this.xhr.onload = () => {
                if (this.aborted == true)
                {
                    reject({
                        status: -1,
                        statusText: "aborted"
                    });
                }
                else if (this.xhr.status >= 200 && this.xhr.status < 300) 
                {
                    let hs = this.xhr.getAllResponseHeaders();
                    resolve(this.xhr.response);
                }
                else
                {
                    reject({
                        status: this.xhr.status,
                        statusText: this.xhr.statusText
                    });               
                }
            };
            
            this.xhr.onerror = () => {
                if (this.aborted == true)
                {
                    reject({
                        status: -1,
                        statusText: "aborted"
                    });
                }
                else
                {
                    reject({
                        status: this.xhr.status,
                        statusText: this.xhr.statusText
                    });
                }
            }

            if (this.opt.headers)
            {
                for (let h of this.opt.headers)
                    this.xhr.setRequestHeader(h.key, h.value);
            }

            this.xhr.send(data);
        });

        return prH;
    }

    Abort()
    {
        if (this.xhr)
            this.xhr.abort();
        this.aborted = true;
    }
}