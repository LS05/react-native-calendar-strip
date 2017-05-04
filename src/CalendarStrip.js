import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    Button,
    Animated,
    Alert,
    Easing,
    TouchableHighlight,
    ScrollView
} from 'react-native';
import CalendarDay from './CalendarDay';
import moment from 'moment';
import styles from './Calendar.style.js';

//Just a shallow array of 7 elements
const arr = [];
for (let i = 0; i < moment().daysInMonth(); i++) {
    arr.push(i);
}
class F_Button extends Component {
  render() {
    return (
      <TouchableHighlight
        underlayColor={'white'}
        activeOpacity={0.7}
        onPress={() => { this.props.onPress() }}>
        <View style={styles.FButton}>
          <Image style={styles.FButtonImage} source={require('./img/arrow-right.png')}/>
        </View>
      </TouchableHighlight>
    );
  }
}

class B_Button extends Component {
  render() {
    return (
      <TouchableHighlight
        underlayColor={'white'}
        activeOpacity={0.7}
        onPress={() => { this.props.onPress() }}>
        <View style={styles.BButton}>
          <Image style={styles.BButtonImage} source={require('./img/arrow-left.png')}/>
        </View>
      </TouchableHighlight>
    );
  }
}

/*
 * Class CalendarStrip that is representing the whole calendar strip and contains CalendarDay elements
 *
 */
export default class CalendarStrip extends Component {

    static propTypes = {
        style: React.PropTypes.any,
        calendarColor: React.PropTypes.string,
        highlightColor: React.PropTypes.string,
        borderHighlightColor: React.PropTypes.string,

        startingDate: React.PropTypes.any,
        selectedDate: React.PropTypes.any,
        onDateSelected: React.PropTypes.func,
        onWeekChanged: React.PropTypes.func,
        useIsoWeekday: React.PropTypes.bool,

        iconStyle: React.PropTypes.any,
        iconContainer: React.PropTypes.any,

        calendarHeaderStyle: React.PropTypes.any,
        calendarHeaderFormat: React.PropTypes.string,

        calendarAnimation: React.PropTypes.object,
        selection: React.PropTypes.string,
        selectionAnimation: React.PropTypes.object,

        dateNameStyle: React.PropTypes.any,
        dateNumberStyle: React.PropTypes.any,
        weekendDateNameStyle: React.PropTypes.any,
        weekendDateNumberStyle: React.PropTypes.any,
        highlightDateNameStyle: React.PropTypes.any,
        highlightDateNumberStyle: React.PropTypes.any,
        styleWeekend: React.PropTypes.bool,

        pagingEnabled: React.PropTypes.bool,
        showsHorizontalScrollIndicator: React.PropTypes.bool,

        locale: React.PropTypes.object
    };

    static defaultProps = {
        startingDate: moment(),
        pagingEnabled: true,
        useIsoWeekday: true,
        showsHorizontalScrollIndicator: false,
        calendarHeaderFormat: 'MMMM YYYY'
    };

    constructor(props) {
        super(props);

        if(props.locale) {
            if(props.locale.name && props.locale.config) {
                moment.locale(props.locale.name, props.locale.config);
            } else {
                throw new Error('Locale prop is not in the correct format. \b Locale has to be in form of object, with params NAME and CONFIG!');
            }
        }

        const startingDate = this.setLocale(moment(this.props.startingDate));
        const selectedDate = this.setLocale(moment(this.props.selectedDate));

        this.state = {
            startingDate,
            selectedDate,
            month: moment().month()
        };

        this.onTapF = () => {
          console.log('Current Month: ' + this.state.month);
          let incMonth = this.state.month += 1;
          let forwaredDate = moment().month(incMonth).startOf('month');
          this.setDay(forwaredDate);
          this.setState({
            month: forwaredDate.month()
          }, function(){
            console.log('Next Month: ' + this.state.month);
            this.onDateSelected(forwaredDate);
          });
        }

        this.onTapB = () => {
          console.log('Current Month: ' + this.state.month);
          let incMonth = this.state.month -= 1;
          let backwardedDate = moment().month(incMonth).startOf('month');
          this.setDay(backwardedDate);
          this.setState({
            month: backwardedDate.month()
          }, function(){
            console.log('Prev Month: ' + this.state.month);
            this.onDateSelected(backwardedDate);
          });
        }

        this.resetAnimation();

        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUpdate = this.componentWillUpdate.bind(this);
        this.getDatesForMonth = this.getDatesForMonth.bind(this);
        this.getPreviousWeek = this.getPreviousWeek.bind(this);
        this.getNextWeek = this.getNextWeek.bind(this);
        this.onDateSelected = this.onDateSelected.bind(this);
        this.isDateSelected = this.isDateSelected.bind(this);
        this.formatCalendarHeader = this.formatCalendarHeader.bind(this);
        this.animate = this.animate.bind(this);
        this.resetAnimation = this.resetAnimation.bind(this);
        this.scrollToActiveDay = this.scrollToActiveDay.bind(this);
        this.setDay = this.setDay.bind(this);
    }

    setDay(date) {
      if (date.day() === 0 ){
        date.add(1, 'days');
      } else if (date.day() === 6) {
        date.add(2, 'days');
      }
    }

    //Animate showing of CalendarDay elements
    componentDidMount() {
        this.animate();
    }

    //Receiving props and set selected date
    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedDate !== this.props.selectedDate) {
            const selectedDate = this.setLocale(moment(nextProps.selectedDate));
            this.setState({
                selectedDate
            });
        }
    }

    //Only animate CalendarDays if the selectedDate is the same
    //Prevents animation on pressing on a date
    componentWillUpdate(nextProps, nextState) {
        if (nextState.selectedDate === this.state.selectedDate) {
            this.resetAnimation();
            this.animate();
        }
    }

    //Function that checks if the locale is passed to the component and sets it to the passed moment instance
    setLocale(momentInstance) {
        if (this.props.locale) {
            momentInstance.locale(this.props.locale.name);
        }
        return momentInstance;
    }

    //Set startingDate to the previous week
    getPreviousWeek() {
        const previousWeekStartDate = this.state.startingDate.subtract(1, 'w');
        this.setState({startingDate: previousWeekStartDate});
        if (this.props.onWeekChanged) {
            this.props.onWeekChanged(previousWeekStartDate.clone().startOf(this.props.useIsoWeekday ? 'isoweek' : 'week'));
        }
    }

    //Set startingDate to the next week
    getNextWeek() {
        const nextWeekStartDate = this.state.startingDate.add(1, 'w');
        this.setState({startingDate: nextWeekStartDate});
        if (this.props.onWeekChanged) {
            this.props.onWeekChanged(nextWeekStartDate.clone().startOf(this.props.useIsoWeekday ? 'isoweek' : 'week'));
        }
    }

    //Get dates for the week based on the startingDate
    //Using isoWeekday so that it will start from Monday
    getDatesForMonth() {
        const me = this;
        let dates = [];
        let year = this.state.startingDate.year();
        let month = this.state.startingDate.month();

        arr.forEach((item) => {
            let date = moment([year, month, item + 1]);
            dates.push(date);
        });

        return dates;
    }

    //Handling press on date/selecting date
    onDateSelected(date) {
        console.log(date);
        this.setState({selectedDate: date});
        if (this.props.onDateSelected) {
            this.props.onDateSelected(date);
        }
    }

    //Function to check if provided date is the same as selected one, hence date is selected
    //using isSame moment query with 'day' param so that it check years, months and day
    isDateSelected(date) {
        return date.isSame(this.state.selectedDate, 'day');
    }

    //Function for reseting animations
    resetAnimation() {
        this.animatedValue = [];
        arr.forEach((value) => {
            this.animatedValue[value] = new Animated.Value(0);
        });
    }

    //Function to animate showing the CalendarDay elements.
    //Possible cases for animations are sequence and parallel
    animate() {
        if (this.props.calendarAnimation) {
            let animations = arr.map((item) => {
                return Animated.timing(
                    this.animatedValue[item],
                    {
                        toValue: 1,
                        duration: this.props.calendarAnimation.duration,
                        easing: Easing.linear
                    }
                );
            });

            if (this.props.calendarAnimation.type.toLowerCase() === 'sequence') {
                Animated.sequence(animations).start();
            } else {
                if (this.props.calendarAnimation.type.toLowerCase() === 'parallel') {
                    Animated.parallel(animations).start();
                } else {
                    throw new Error('CalendarStrip Error! Type of animation is incorrect!');
                }
            }
        }
    }

    //Function that formats the calendar header
    //It also formats the month section if the week is in between months
    formatCalendarHeader() {
        let daysForMonth = this.getDatesForMonth();
        let daysLenght = daysForMonth.length;
        let firstDay = daysForMonth[0];
        let lastDay = daysForMonth[daysLenght - 1];
        let monthFormatting = '';
        //Parsing the month part of the user defined formating
        if ((this.props.calendarHeaderFormat.match(/Mo/g) || []).length > 0) {
            monthFormatting = 'Mo';
        } else {
            if ((this.props.calendarHeaderFormat.match(/M/g) || []).length > 0) {
                for (let i = (this.props.calendarHeaderFormat.match(/M/g) || []).length; i > 0; i--) {
                    monthFormatting += 'M';
                }
            }
        }

        if (firstDay.month() === lastDay.month()) {
            return firstDay.format(this.props.calendarHeaderFormat);
        }
        if (firstDay.year() !== lastDay.year()) {
            return `${firstDay.format(this.props.calendarHeaderFormat)} / ${lastDay.format(this.props.calendarHeaderFormat)}`;
        }
        return `${monthFormatting.length > 1 ? firstDay.format(monthFormatting) : ''} ${monthFormatting.length > 1 ? '/' : ''} ${lastDay.format(this.props.calendarHeaderFormat)}`;
    }

    scrollToActiveDay(activeX){
      setTimeout(() => {
        this.refs.datesScrollView.scrollTo({x: activeX - 10}, true);
      }, 1000);
    }

    render() {
      console.log('render');
      let opacityAnim = 1;
      let datesRender = this.getDatesForMonth().map((date, index) => {
          if (this.props.calendarAnimation) {
              opacityAnim = this.animatedValue[index];
          }
          return (
              <Animated.View key={'day_' + index} style={{opacity: opacityAnim, flex: 1}}>
                  <CalendarDay
                      date={date}
                      key={date}
                      selected={this.isDateSelected(date)}
                      onDateSelected={this.onDateSelected}
                      calendarColor={this.props.calendarColor}
                      highlightColor={this.props.highlightColor}
                      dateNameStyle={this.props.dateNameStyle}
                      dateNumberStyle={this.props.dateNumberStyle}
                      weekendDateNameStyle={this.props.weekendDateNameStyle}
                      weekendDateNumberStyle={this.props.weekendDateNumberStyle}
                      highlightDateNameStyle={this.props.highlightDateNameStyle}
                      highlightDateNumberStyle={this.props.highlightDateNumberStyle}
                      styleWeekend={this.props.styleWeekend}
                      selection={this.props.selection}
                      selectionAnimation={this.props.selectionAnimation}
                      borderHighlightColor={this.props.borderHighlightColor}
                      activeDayCoord={this.scrollToActiveDay}
                  />
              </Animated.View>
          );
      });
      return (
          <View style={[styles.calendarContainer, {backgroundColor: this.props.calendarColor}, this.props.style]}>
              <View>
                <F_Button onPress={() => { this.onTapF() }} />
                {<Text style={[styles.calendarHeader, this.props.calendarHeaderStyle]}>{this.formatCalendarHeader()}</Text>}
                <B_Button onPress={() => { this.onTapB() }} />
              </View>
              <ScrollView pagingEnabled={this.props.pagingEnabled}
                          horizontal={true}
                          showsHorizontalScrollIndicator={this.props.showsHorizontalScrollIndicator}
                          onMomentumScrollEnd={() => console.log('onMomentumScrollEnd')}
                          ref='datesScrollView'>
                  <View style={styles.calendarDates}>
                      {datesRender}
                  </View>
              </ScrollView>
          </View>
      );
    }
}
