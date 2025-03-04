export const compress = async (file, maxSize) => {
  
    
    if (!file || !file.type.match(/image.*/)) return
    
    const image = new Image()
    const canvas = document.createElement('canvas')
    const max_size = maxSize
    image.src = URL.createObjectURL(file)
    await image.decode()
    let width = image.width
    let height = image.height
    
    // Resizing the image and keeping its aspect ratio
    if (width > height) {
      if (width > max_size) {
          height *= max_size / width
          width = max_size
      }
    } else {
        if (height > max_size) {
            width *= max_size / height
            height = max_size
        }
    }
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    return  canvas.toDataURL()
}