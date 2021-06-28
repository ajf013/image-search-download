import React, { useState } from "react";  
import axios from 'axios';  
import { Card } from 'react-bootstrap'; 
import Footer from './components/Footer/Footer';
 
function GooglePexel() {  
    const [search, setSearch] = useState("");  
    const [perPage, setPerPage] = useState("");  
    const [result, setResult] = useState([]);  

    function handleChange(event) {  
        const search = event.target.value;  
        setSearch(search);  
    }  
    function noOfPics(event) {  
        const perPage = event.target.value;  
        setPerPage(perPage);  
    }  
  
    function handleSubmit(event) {  
        event.preventDefault();  
        const url = "https://api.pexels.com/v1/search?query=" + search + "&per_page=" + perPage;  
        const access_token = '563492ad6f91700001000001a7f96507d83d455db06d06709929e930';  
        axios.get(url, {  
            headers: {  
                'Authorization': `${access_token}`  
            }  
        }).then(data => {  
            console.log(data);  
            setResult(data.data.photos);  
        })  
  
    }  
    return (  
        <form onSubmit={handleSubmit}>  
            <div className="card-header main-search">  
                <div className="row">  
                    <div className="col-12 col-md-3 col-xl-3">  
                        <input style={{ 'margin-top': '10px' }} onChange={handleChange} className="AutoFocus form-control" placeholder="Type something..." type="text" />  
                    </div>  
                    <div className="col-12 col-md-3 col-xl-3">  
                        <input style={{ 'margin-top': '10px' }} onChange={noOfPics} name="deliveryNumber" className="AutoFocus form-control" placeholder="No of Images"  
                            type="text" />  
                    </div>  
                    <div className="col-12 col-md-3 col-xl-3">  
                        <input style={{ 'margin-top': '10px' }} type="submit" value="Search" className="btn btn-primary search-btn" />  
                    </div>  
                </div>  
            </div>  
            <div class="container">  
                <div class="row">  
                    {result.map(search => (  
                        <div className="col-sm-4">  
                            <Card style={{ 'margin-top': '20px' }}>  
                                <Card.Img variant="top" src={search.src.landscape} alt={search.photographer} /> 
                                <button onclick="download()">Download</button> 
                            </Card>  
                        </div>  
                    ))}  
                </div>  
                <Footer />
            </div>  
        </form>  
    )  
}  
  
export default GooglePexel;