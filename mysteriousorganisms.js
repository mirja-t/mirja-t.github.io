// Returns a random DNA base
const returnRandBase = () => {
  const dnaBases = ['A', 'T', 'C', 'G']
  return dnaBases[Math.floor(Math.random() * 4)] 
}

// Returns a random single stand of DNA containing 15 bases
const mockUpStrand = () => {
  const newStrand = [];
  for (let i = 0; i < 15; i++) {
    newStrand.push(returnRandBase())
  }
  return newStrand
}

const pAequorFactory = (num, arr) =>{
  return{
    specimenNum: num,
    dna: arr,
    mutate(){
      let newBase = returnRandBase();
      const baseToChange = Math.floor(Math.random() * this.dna.length);
      while(newBase === this.dna[baseToChange]) {
        newBase = returnRandBase();
      }
      this.dna[baseToChange] = newBase;
      return this.dna;
    },
    compareDNA(pAequor){
      let accordance = 0;
      console.log(this.dna);
      for(let i = 0; i < pAequor.dna.length; i++){
        if(this.dna[i] === pAequor.dna[i]){
          accordance += 100/pAequor.dna.length;
        }
      }
      console.log(`The accordance of the compared DNA is ${accordance}%`);
    },
    willLikelySurvive(){
      const CGs = this.dna.filter(base => base === 'C' || base === 'G');
      return CGs.length / this.dna.length > 0.6;
    },
    complementStrand(){
      const strands = ['A', 'C', 'T', 'G'];
      const complement = [];
      for(let i = 0; i < this.dna.length; i++) {
          const index = strands.indexOf(this.dna[i]);
          const complementIndex = (index + 2) % 4;
          complement.push(strands[complementIndex])
      }
      return complement;
    }
  }
}
const pAequor = pAequorFactory(1, mockUpStrand());
const newpAequor = pAequorFactory(1, mockUpStrand());
pAequor.compareDNA(newpAequor);

const pAequorWhoCanSurvive = [];
while(pAequorWhoCanSurvive.length < 30){
  const newpAequor = pAequorFactory(1, mockUpStrand());
  if(newpAequor.willLikelySurvive()){
    pAequorWhoCanSurvive.push(newpAequor);
  }  
}

console.log(pAequor.dna, pAequor.complementStrand());
