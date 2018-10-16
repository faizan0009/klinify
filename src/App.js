import React, { Component } from 'react';
import './App.css';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
const imageMaxSize =1000000

class App extends Component {

  state = {
    image : null,
    crop: {
      aspect : 1/1,
    },
    savedImage : null,
    button : false,
  };

  componentDidMount = () => {
    this.imagePreviewCanvasRef = React.createRef();
  }

  verifyFile = (files) => {
    if(files && files.length > 0)
    {
      const currentFile = files[0];
      // const currentFiletype = currentFile.type;
      const currentFileSize = currentFile.size;
      if(currentFileSize > imageMaxSize)
      {
        console.log("image size not allowed");
        return false;
      }
      return true;
    }
  }

  image64toCanvasRef = (canvasref, image64, pixelCrop) => {
    const canvas = canvasref;
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = image64;
    image.onload = function () {
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )
    }
  }

  handleChange = (e) => {
    const files = e.target.files;
    const isVerified = this.verifyFile(files);
    if(isVerified)
    {
      const currentFile = files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        this.setState({
          image : reader.result,
          noImg : false
        })
      }, false);
      reader.readAsDataURL(currentFile);
    }
    
  }

  handleOnCropChange = (crop) => {
    this.setState({crop : crop})
  }

  handleImageLoaded = (image) => {
    console.log(image);
  }

  handleOnCropComplete = (crop , pixelCrop) => {
    console.log(crop, pixelCrop);

    const canvasRef = this.imagePreviewCanvasRef.current;
    this.image64toCanvasRef(canvasRef, this.state.image, pixelCrop)
  }

  base64StringtoFile = (base64String, filename) => {
    var arr = base64String.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, {type: mime})
  }

  extractImageFileExtensionFromBase64 = (base64Data) => {
    return base64Data.substring('data:image/'.length, base64Data.indexOf(';base64'))
  }

  handleSave = (e) => {
    if(this.state.image)
    {
    e.preventDefault();
    const canvasRef = this.imagePreviewCanvasRef.current;
    const fileExtension = this.extractImageFileExtensionFromBase64(this.state.image);
    const imageData64 = canvasRef.toDataURL('image/' + fileExtension);

    const myFilename = "previewFile." + fileExtension;

    const NewCroppedFile = this.base64StringtoFile(imageData64, myFilename);
    const currentFile = NewCroppedFile;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        this.setState({
          savedImage : reader.result,
          button : true,
        })
      }, false);
      reader.readAsDataURL(currentFile);
    }
    else{
      this.setState({noImg:true});
    }
  }

  ImagetoPrint = (source) => {
    return "<html><head><script>function step1(){\n" +
            "setTimeout('step2()', 10);}\n" +
            "function step2(){window.print();window.close()}\n" +
            "</scri" + "pt></head><body onload='step1()'>\n" +
            "<img src='" + source + "' /></body></html>";
}


  handlePrint = () => {
    const popup = window.open();
    popup.document.write(this.ImagetoPrint(this.state.savedImage));
    popup.focus(); //required for IE
    popup.print();
    popup.close();
  }

  render() {
    return (
      <div className="App">
      <h1>Input Image</h1>
        <input type='file' onChange = {this.handleChange}/>
        {this.state.image ?
        <div>
          <ReactCrop 
          src={this.state.image} 
          crop={this.state.crop} 
          onChange={this.handleOnCropChange}
          onComplete={this.handleOnCropComplete}
          onImageLoaded={this.handleImageLoaded}/>

          <br/>
          <p>Preview Saved Image</p>
          {this.state.savedImage ? 
            <img src={this.state.savedImage} alt="save"/>
           : null}
          <canvas style={{display:"none"}} ref={this.imagePreviewCanvasRef}></canvas>
            <br/>
        
        </div>
        : null}
        <div style={{"paddingTop": "50px", "paddingBottom": "50px"}}>
        {this.state.noImg?
        <p>Please select image</p> : null}
          <button onClick={this.handleSave}>Save Image</button>
          <br/>
          {this.state.button ? 
          <button onClick={this.handlePrint}>Print Preview</button>
          : <button disabled>Print Preview</button> }
        </div>
      </div>
       
    );
  }
}

export default App;
