import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import { t } from '../../../utils/i18n';
import manifest from '../../../utils/manifest';
import * as converters from '../../../utils/destinyConverters';
import * as enums from '../../../utils/destinyEnums';
import { itemComponents } from '../../../utils/destinyItems/itemComponents';
import { sockets } from '../../../utils/destinyItems/sockets';
import { stats } from '../../../utils/destinyItems/stats';
import { masterwork } from '../../../utils/destinyItems/masterwork';
import { getOrnamentSocket } from '../../../utils/destinyItems/utils';
import ObservedImage from '../../ObservedImage';
import { Common } from '../../../svg';

import './styles.css';

import Default from './Default';
import Equipment from './Equipment';
import Emblem from './Emblem';
import Mod from './Mod';
import SubClass from './SubClass';
import TrialsPassage from './TrialsPassage';

const woolworths = {
  equipment: Equipment,
  emblem: Emblem,
  mod: Mod,
  'sub-class': SubClass,
  'trials-passage': TrialsPassage,
};

const hideScreenshotBuckets = [
  3284755031, // subclass
  1506418338, // artifact
];

class Item extends React.Component {
  render() {
    const member = this.props.member;

    const definitionItem = manifest.DestinyInventoryItemDefinition[this.props.hash];

    const item = {
      itemHash: definitionItem?.hash || +this.props.hash,
      itemInstanceId: this.props.instanceid,
      itemComponents: null,
      quantity: +this.props.quantity || 1,
      state: +this.props.state || 0,
      vendorHash: this.props.vendorhash,
      vendorItemIndex: this.props.vendoritemindex,
      rarity: converters.itemRarityToString(definitionItem?.inventory?.tierType),
      type: null,
      style: this.props.style,
    };

    if (item.itemHash !== 343 && !definitionItem) {
      return null;
    }

    if (item.itemHash === 343 || definitionItem.redacted) {
      return (
        <>
          <div className='acrylic' />
          <div className={cx('frame', 'common')}>
            <div className='header'>
              <div className='name'>{t('Classified')}</div>
              <div>
                <div className='kind'>{t('Insufficient clearance')}</div>
              </div>
            </div>
            <div className='black'>
              <div className='description'>
                <pre>{t('Keep it clean.')}</pre>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (definitionItem?.inventory) {
      if (definitionItem.itemType === enums.DestinyItemType.Armor || definitionItem.itemType === enums.DestinyItemType.Weapon || definitionItem.itemType === enums.DestinyItemType.Ship || definitionItem.itemType === enums.DestinyItemType.Vehicle || definitionItem.itemType === enums.DestinyItemType.Ghost || definitionItem.itemType === enums.DestinyItemType.SeasonArtifact) {
        item.type = 'equipment';
      } else if (definitionItem.itemType === enums.DestinyItemType.Emblem) {
        item.type = 'emblem';
      } else if (definitionItem.itemType === enums.DestinyItemType.Mod) {
        item.type = 'mod';
      } else if (enums.trialsPassages.indexOf(definitionItem.hash) > -1) {
        item.type = 'trials-passage';
      }

      item.screenshot = definitionItem.screenshot;
    }

    item.itemComponents = itemComponents(item, member);
    item.sockets = sockets(item);
    item.stats = stats(item);
    item.masterwork = masterwork(item);

    item.primaryStat = (definitionItem.itemType === 2 || definitionItem.itemType === 3) &&
      definitionItem.stats &&
      !definitionItem.stats.disablePrimaryStatDisplay &&
      definitionItem.stats.primaryBaseStatHash && {
        hash: definitionItem.stats.primaryBaseStatHash,
        displayProperties: manifest.DestinyStatDefinition[definitionItem.stats.primaryBaseStatHash].displayProperties,
        value: 750,
      };

    if (item.primaryStat && item.itemComponents && item.itemComponents.instance?.primaryStat) {
      item.primaryStat.value = item.itemComponents.instance.primaryStat.value;
    } else if (item.primaryStat && member && member.data) {
      let character = member.data.profile.characters.data.find((c) => c.characterId === member.characterId);

      item.primaryStat.value = Math.floor((942 / 973) * character.light);
    }

    let importantText = false;
    if (!item.itemComponents && this.props.uninstanced) {
      importantText = t('Collections roll');
    }

    const Meat = item.type && woolworths[item.type];

    if (item.sockets) {
      const ornament = getOrnamentSocket(item.sockets);

      if (ornament && ornament.plug?.plugItem?.screenshot && ornament.plug?.plugItem?.screenshot !== '') {
        item.screenshot = ornament.plug.plugItem.screenshot;
      }
    }

    const itemState = enums.enumerateItemState(item.state);
    const masterworked = itemState.masterworked || (!item.itemInstanceId && (definitionItem.itemType === enums.DestinyItemType.Armor ? item.masterwork?.stats?.filter((s) => s.value > 9).length : item.masterwork?.stats?.filter((s) => s.value >= 9).length));

    // console.log(item)

    return (
      <>
        <div className='acrylic' />
        <div className={cx('frame', 'item', item.style, item.type, item.rarity, { masterworked: masterworked })}>
          <div className='header'>
            {masterworked ? <ObservedImage className={cx('image', 'bg')} src={item.rarity === 'exotic' ? `/static/images/extracts/flair/01A3-00001DDC.PNG` : `/static/images/extracts/flair/01A3-00001DDE.PNG`} /> : null}
            <div className='name'>{definitionItem.displayProperties && definitionItem.displayProperties.name}</div>
            <div>
              {definitionItem.itemTypeDisplayName && definitionItem.itemTypeDisplayName !== '' ? <div className='kind'>{definitionItem.itemTypeDisplayName}</div> : null}
              <div>
                {item.rarity && item.style !== 'ui' ? <div className='rarity'>{definitionItem.inventory.tierTypeName}</div> : null}
                {itemState.locked && item.style !== 'ui' ? (
                  <div className='item-state'>
                    <Common.ItemStateLocked />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {importantText ? <div className='highlight major'>{importantText}</div> : null}
          <div className='black'>
            {this.props.viewport.width <= 600 && item.screenshot && !(definitionItem && definitionItem.inventory && hideScreenshotBuckets.includes(definitionItem.inventory.bucketTypeHash)) ? (
              <div className='screenshot'>
                <ObservedImage className='image' src={`https://www.bungie.net${item.screenshot}`} />
              </div>
            ) : null}
            {woolworths[item.type] ? <Meat {...member} {...item} /> : <Default {...member} {...item} />}
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport,
    tooltips: state.tooltips,
  };
}

export default connect(mapStateToProps)(Item);
