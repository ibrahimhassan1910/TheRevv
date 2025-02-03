import { useState } from 'react';

function AddCar() {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [make, setMake] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
 

  const handleSubmit = async (event) => {
    event.preventDefault();

    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('color', color);
    formData.append('make', make);
    formData.append('description', description);
    formData.append('image', image); // File input
    formData.append('video_url', videoUrl); // Text input

    try {
        const response = await fetch('http://localhost:5000/add-car', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Car added successfully:', result.message);

            // Reload page after successfully posting a car to the db
            window.location.reload();
        } else {
            console.error('Failed to add car:', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

  return (
    <div>
      <h2>Add a New Car</h2>
      <form className='' onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Car Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
        <input
           type="file"
            accept="image/*" // Only accept image files
            onChange={(e) => setImage(e.target.files[0])} // Update state with the uploaded file
        />
        <button type="submit">Add Car</button>
      </form>
    </div>
  );
}

export default AddCar;
