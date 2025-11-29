import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import {useNavigate} from 'react-router-dom';

export default function CourseCard({courseName, courseId}) {
  const navigate = useNavigate();
    const handleClick = () => {
      navigate(`/conceptmap/${courseName}`, {
        state: { courseId } 
      });
  };
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick = {handleClick}>
        {/* i would like to add a preview of the concept map as the image, link will probably need to have extra params for each course */}
        {/* <CardMedia
          component="img"
          height="140"
          image="/static/images/cards/contemplative-reptile.jpg"
          alt="green iguana"
        /> */}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {courseName}
          </Typography>
          {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Lizards are a widespread group of squamate reptiles, with over 6,000
            species, ranging across all continents except Antarctica
          </Typography> */}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
