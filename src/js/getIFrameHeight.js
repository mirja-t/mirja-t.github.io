export const getIFrameHeight = id => {
    const current = document.getElementById(id);
    const setHeight = () => {
        current.height = "";
        current.height = current.contentWindow.document.body.scrollHeight + "px";
    }
    console.log(current.parentElement)
    //current.style.pointerEvents = 'none';
    const stoppropagation = () => {
        console.log('scroll')
    }
    const enablepropagation = (e) => {
        //current.style.pointerEvents = 'auto';
        alert('click', e, e.currentTarget)
    }
    window.onload = function() {
        var frm = current.contentWindow;
        frm.onscroll = function(){
          alert("scrolling...");
        }
      }
    if(current) {
        current.parentElement.addEventListener('click', enablepropagation);
        current.parentElement.addEventListener('wheel', stoppropagation);
        current.addEventListener('load', setHeight);
    }  
}