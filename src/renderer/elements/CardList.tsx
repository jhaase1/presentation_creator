import { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import jsyaml from 'js-yaml';
import CardVisual, { Card, initializeCard, cardYAMLType } from './Card';

export interface CardList {
  cards: Card[];
  windowHeight: number;
}

const defaultProps: CardList = {
  cards: [],
  windowHeight: 500,
};

class CardListVisual extends Component<{}, CardList> {
  private static instance: CardListVisual | null = null;

  constructor(props: CardList = defaultProps) {
    super(props);

    if (CardListVisual.instance) {
      return CardListVisual.instance;
    }

    CardListVisual.instance = this;

    this.state = {
      cards: [],
      windowHeight: window.innerHeight,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.setState({ windowHeight: window.innerHeight });
  };

  addCard = (options: Partial<Card> = {}) => {
    const addCardAsync = async () => {
      const newCard = await initializeCard(options);
      this.setState((prevState) => ({
        cards: [...prevState.cards, newCard],
      }));
    };

    addCardAsync();
  };

  deleteCard = (id: string) => {
    this.setState((prevState) => ({
      cards: prevState.cards.filter((card) => card.id !== id),
    }));
  };

  moveCard = (fromIndex: number, toIndex: number) => {
    this.setState((prevState) => {
      const cards = [...prevState.cards];
      const [removed] = cards.splice(fromIndex, 1);
      cards.splice(toIndex, 0, removed);
      return { cards };
    });
  };

  setBlankSlide = (id: string, blankSlide: boolean) => {
    this.setState((prevState) => {
      const newCards = prevState.cards.map((card) =>
        card.id === id ? { ...card, blankSlide } : card,
      );
      return { cards: newCards };
    });
  };

  setUseSidebar = (id: string, useSidebar: boolean) => {
    this.setState((prevState) => {
      const newCards = prevState.cards.map((card) =>
        card.id === id ? { ...card, useSidebar } : card,
      );
      return { cards: newCards };
    });
  };

  setFile = (id: string, file: string) => {
    this.setState((prevState) => {
      const newCards = prevState.cards.map((card) =>
        card.id === id ? { ...card, file } : card,
      );
      return { cards: newCards };
    });
  };

  setCards = (newCards: Card[]) => {
    this.setState({ cards: newCards });
  };

  getCards = (): Card[] => {
    return this.state.cards;
  };

  renderCards() {
    const { cards, windowHeight } = this.state;
    const buttonHeight = 60;

    return (
      <DndProvider backend={HTML5Backend}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            maxHeight: `${windowHeight - 4 * buttonHeight}px`,
          }}
        >
          {cards.map((card, index) => (
            <CardVisual
              key={card.id}
              card={card}
              index={index}
              setFile={this.setFile}
              setUseSidebar={this.setUseSidebar}
              setBlankSlide={this.setBlankSlide}
              moveCard={this.moveCard}
              deleteCard={this.deleteCard}
              setCards={this.setCards}
            />
          ))}
        </div>
      </DndProvider>
    );
  }

  render() {
    return (
      <div>
        {this.renderCards()}
        <button onClick={() => this.addCard()}>Add Additional Element</button>
      </div>
    );
  }
}

export default CardListVisual;
