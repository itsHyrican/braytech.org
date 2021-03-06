import React from 'react';
import { connect } from 'react-redux';

import { t, BungieText } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import { Tooltips } from '../../../svg';

import './styles.css';

export const recallMissions = [
  2306231495, // A Mysterious Disturbance
  471727774, // In the Deep
  1326496189, // Beyond
];

const storyMissions = [
  4167922031, // In the Deep
  661325298, // In Search of Answers
  778535230, // Beyond
  2446907856, // A Mysterious Disturbance
];

class LunasRecall extends React.Component {
  render() {
    const characterActivities = this.props.member.data.profile.characterActivities.data;

    // const miss = Object.values(manifest.DestinyActivityDefinition).filter(a => a.destinationHash === 290444260 && a.directActivityModeType === 2 && a.displayProperties?.name && a.displayProperties?.name !== '' && a.displayProperties.name.indexOf('Nightmare') > -1);

    // console.log(miss.map(a => `${a.hash},   // ${a.displayProperties.name}`).join('\n'));

    // console.log(characterActivities[member.characterId].availableActivities.map(a => ({ name: manifest.DestinyActivityDefinition[a.activityHash]?.displayProperties?.name, ...a, definition: manifest.DestinyActivityDefinition[a.activityHash] })));

    const recallMission = characterActivities[this.props.member.characterId].availableActivities.find((a) => recallMissions.includes(a.activityHash));
    const storyMission = characterActivities[this.props.member.characterId].availableActivities.find((a) => storyMissions.includes(a.activityHash));

    const definitionStoryMission = manifest.DestinyActivityDefinition[recallMission?.activityHash || storyMission?.activityHash];

    if ((!recallMission && !storyMission) || !definitionStoryMission) {
      return null;
    }

    return (
      <div className='user-module lunar'>
        <div className='sub-header'>
          <div>{manifest.DestinyDestinationDefinition[290444260].displayProperties?.name}</div>
        </div>
        <h3>{manifest.DestinyObjectiveDefinition[1296970487]?.displayProperties.name}</h3>
        <div className='text'>
          <p>{manifest.DestinyInventoryItemDefinition[2178015352]?.displayProperties.description}</p>
          <p>
            <em>{manifest.DestinyObjectiveDefinition[1296970487]?.displayProperties.description}</em>
          </p>
        </div>
        <h4>{t('Mission')}</h4>
        <div className='story-mission'>
          <ul className='list inventory-items'>
            <li className='linked tooltip' data-type='activity' data-hash={definitionStoryMission.hash} data-mode='175275639'>
              <div className='icon'>
                <Tooltips.Story />
              </div>
            </li>
          </ul>
          <div className='text'>
            <div className='name'>{definitionStoryMission.displayProperties.name}</div>
            <BungieText className='description' value={definitionStoryMission.displayProperties.description} />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    member: state.member,
  };
}

export default connect(mapStateToProps)(LunasRecall);
