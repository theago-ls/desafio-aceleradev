const http = require('http')
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const sha1 = require('js-sha1')

const hostname = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello World!\n')
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

async function executeChallenge(){
    try {
        const response = await axios.get('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=b865f267049c87fb70d4173392ed2363fb53a981')

        if(response.status === 200){            
            fs.writeFileSync('answers.json', JSON.stringify(response.data));
                        
            var data = fs.readFileSync('answers.json')
            var dataJSON = JSON.parse(data)  
            
            var cifrado = dataJSON.cifrado

            const decifrado = decifrar(cifrado, parseInt(dataJSON.numero_casas))

            dataJSON.decifrado = decifrado 

            const resumo = sha1(decifrado)

            dataJSON.resumo_criptografico = resumo
                        
            fs.writeFileSync('answers.json', JSON.stringify(dataJSON));

            const file = fs.createReadStream('answers.json')

            const form = new FormData()

            form.append('answer', file)

            const resposta = await axios.post('https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=b865f267049c87fb70d4173392ed2363fb53a981'
            , form,{
                headers: form.getHeaders()
            })
        
            console.log(resposta.data);
        }
    } catch (err) {
        console.error(err)
    }
}

function decifrar(dados, casas){
    const vocab = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

    var texto = []

    for(var i = 0; i < dados.length; i++){        
        if(vocab.indexOf(dados[i]) !== -1){
            var index = vocab.indexOf(dados[i])            
            texto += vocab[(index-casas+26) % 26];
        }else
            texto += dados[i];        
    }

    return texto
}

executeChallenge();