import { registerObserver } from './db.js';
'use strict';

export class StockPosition extends React.Component {
  render() {
    const color = this.props.position.data.state == 0
      ? 'gray'
      : this.props.position.data.state == 2
        ? (this.props.position.data.hold >= this.props.position.data.curr ? 'red' : 'green')
        : 'indigo'

    const online = {
      hold: this.props.position.data.hold.toFixed(8),
      target: this.props.position.data.target.toFixed(8),
      curr: this.props.position.data.curr.toFixed(8),
    }

    online['perc'] = online.hold > 0 ? (((online.curr - online.hold) / online.hold) * 100.000000).toFixed(2) : 0;

    const lastData = {
      hold: this.props.position.last?.hold.toFixed(8),
      target: this.props.position.last?.target.toFixed(8),
      curr: this.props.position.last?.curr.toFixed(8),
    }
    lastData['perc'] = lastData.hold > 0 ? (((lastData.curr - lastData.hold) / lastData.hold) * 100.000000).toFixed(2) : 0;

    performance = {
      buys: ((this.props.position.data.performance.buys[this.props.position.target] ?? 0) -
        (this.props.position.data.performance.buys.last[this.props.position.target] ?? 0)).toFixed(4),
      sells: (this.props.position.data.performance.sells[this.props.position.target] ?? 0).toFixed(4)
    }

    const amounts = {
      buys: ((this.props.position.data.performance.buys.amount ?? 0)  -
        (this.props.position.data.performance.buys.last.amount ?? 0)).toFixed(8),
      sells: (this.props.position.data.performance.sells.amount ?? 0).toFixed(8)
    }

    performance.perc = performance.sells > 0 ? Math.round((1 - (performance.buys / performance.sells)) * 100.000000).toFixed(2) : 0;
    
    const prefColor = performance.buys > performance.sells ? 'red' : 'green';
    
    return React.createElement(
      'div',
      { className: 'shadow-md m-3 my-1 rounded-md border-2 border-gray-600 border-2 border-' + color + '-600 text-right' },
      [
        React.createElement(
          'div',
          { className: 'grid grid-cols-4' },
          [
            React.createElement(
              'div',
              { key: '1', className: 'text-center font-bold italic pt-2 rounded rounded-r-none bg-' + prefColor + '-200' },
              [
                React.createElement(
                  'div',
                  { key: '1', className: 'mb-1' },
                  [
                    this.props.position.target + '/' + this.props.position.source,
                  ]
                ),
                React.createElement(
                  'sup',
                  { key: '2', className: 'text-base text-' + prefColor + '-600 font-bold' },
                  [
                    performance.perc,
                    '%'
                  ]
                )
                ,
              ]
            ),
            React.createElement(
              'div',
              { key: '2', className: 'text-right font-bold italic col-span-2 px-1 border-r grid grid-cols-3 overflow-x-auto' },
              [
                React.createElement(
                  'div',
                  { key: '2', className: 'text-right font-bold italic col-span-2 px-1 border-r md:w-40 w-44' },
                  [
                    React.createElement(
                      'sub',
                      { },
                      [
                        performance.buys + ' (' + amounts.buys + ')'
                      ]
                    ),
                    React.createElement(
                      'div',
                      { className: '' },
                      [
                        (this.props.position.data.performance.buys.last.amount ?? 0).toFixed(8),
                      ]
                    ),
                    React.createElement(
                      'sup',
                      { },
                      [
                        performance.sells + ' (' + amounts.sells + ')'
                      ]
                    )
                  ]
                ),
                React.createElement(
                  'div',
                  { key: '3', className: 'text-right font-bold italic px-1 border-r md:w-20 w-48 ' },
                  [
                    React.createElement(
                      'sub',
                      { },
                      [
                        online.target
                      ]
                    ),
                    React.createElement(
                      'div',
                      { className: '' },
                      [
                        online.hold,
                      ]
                    ),
                    React.createElement(
                      'sup',
                      { },
                      [
                        online.curr
                      ]
                    )
                  ]
                )
              ]
            ),
            React.createElement(
              'div',
              { key: '4', className: 'text-base text-' + color + '-600 font-bold p-2 pt-3 bg-' + color + '-200' },
              [
                online.perc,
                '%'
              ]
            )
          ]
        )
      ]
    );
  }
}

export class Stock extends React.Component {
  render() {
    const positions = [];
    for (const source in this.props.stock.data) {
      positions.push(React.createElement(
        StockPosition,
        { key: 'stockpos_' + this.props.stock.target + '_' + source, position: { source: source, target: this.props.stock.target, data: this.props.stock.data[source], last: this.props.stock.last ? this.props.stock.last[source] : null } }
      ));
    }

    return React.createElement(
      'div',
      { },
      [
        positions
      ]
    );
  }
}

export class StockList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stocks: {}, last: {} };
  }

  componentDidMount() {
    const curr = this
    registerObserver((data) => {
      if (data) {
        var symbols = data.symbols ?? data;
        var performances = data.performances ?? [];
        const last = this.state.last ?? {}
        Object.keys(symbols).map((stock) => {
          return Object.keys(symbols[stock]).map((target) => {
            if (!last[stock]) {
              last[stock] = {}
            }

            if (!last[stock][target]) {
              last[stock][target] = {
                amount: 0,
                curr: 0,
                hold: 0,
                state: 0,
                target: 0,
                upt: 0
              }
            }

            symbols[stock][target].performance = performances[stock][target]
            Object.keys(symbols[stock][target]).map((prop) => {
              if (last[stock][target][prop] != symbols[stock][target][prop]) {
                last[stock][target][prop] = symbols[stock][target][prop]
              }
            });
          })
        })
        
        curr.setState({ stocks: symbols, last: last })
      }
    })
  }

  render() {
    const items = [];
    const performance = {
      buys: 0,
      sells: 0,
      curr: 0,
      hold: 0
    }
    for (const stock in this.state.stocks) {
      for (const target in this.state.stocks[stock]) {
        performance.buys += this.state.stocks[stock][target].performance.buys[stock] -
          (this.state.stocks[stock][target].performance.buys.last[stock] ?? 0);
        performance.sells += this.state.stocks[stock][target].performance.sells[stock];

        performance.curr += this.state.stocks[stock][target].curr * this.state.stocks[stock][target].amount;
        performance.hold += this.state.stocks[stock][target].hold * this.state.stocks[stock][target].amount;
      }

      items.push(React.createElement(
        Stock,
        { key: 'stock_' + stock, stock: { target: stock, data: this.state.stocks[stock], last: this.state.last[stock] } }
      ));
    }

    performance.perc = performance.sells > 0 ? Math.round((1 - (performance.buys / performance.sells)) * 100.000000).toFixed(2) : 0;
    performance.holdPerc = performance.curr > 0 ? Math.round((1 - (performance.hold / performance.curr)) * 100.000000).toFixed(2) : 0;
    performance.moneyPerc = performance.hold > 0 ? Math.round((((performance.sells - performance.buys) / performance.hold)) * 100.000000).toFixed(2) : 0;

    return React.createElement(
      'div',
      { className: 'text-base font-bold p-0 pt-3' },
      [
        React.createElement(
          'div',
          { key: '1', className: 'p-2 text-xs block font-mono m-0' },
          [ 
            React.createElement(
              'div',
              { className: 'grid grid-cols-3' },
              [
                React.createElement(
                  'div',
                  { className: '' },
                  '$ ' + performance.hold.toFixed(2)  + ' '
                ),
                React.createElement(
                  'div',
                  { className: '' },
                  '$ ' + (performance.sells - performance.buys).toFixed(2)  + ' '
                ),
                React.createElement(
                  'div',
                  { className: '' },
                  '- Perc ' + performance.moneyPerc + '%'
                ),
              ]
            )
          ]
        ),
        React.createElement(
          'div',
          { key: '2', className: 'grid lg:grid-cols-2 grid-cols-1 w-full p-0 text-xs font-mono' },
          items
        )
      ]
    )
    return ;
  }
}