import { makeStyles, Theme } from '@material-ui/core/styles';

const styles = makeStyles((theme: Theme) => ({

}))



interface HomeProps {
}

function Home() {
  const classes = styles();

  const element = window.document.createElement('div');

  const svg = (<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>)


  return (
    <div style={{ "height": window.innerHeight }}>
    </div>
  )
}

export default Home;