import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import * as enums from '../../../utils/destinyEnums';
import { progressionSeasonRank } from '../../../utils/destinyUtils';
import Button from '../../UI/Button';
import ProgressBar from '../../UI/ProgressBar';
import Items from '../../Items';

import './styles.css';

function getSeasonPassItemsPerPage(width) {
  if (width > 1280) return 10;
  if (width > 1024) return 8;
  if (width >= 768) return 5;
  if (width < 768) return 3;
  return 3;
}

class SeasonPass extends React.Component {
  state = {
    seasonPassRewardsPage: null,
  };

  static getDerivedStateFromProps(p, s) {
    if (s.seasonPassRewardsPage) {
      return null;
    }

    const { member, viewport } = p;
    const characterProgressions = member.data.profile.characterProgressions.data;

    const definitionSeason = manifest.DestinySeasonDefinition[manifest.settings.destiny2CoreSettings.currentSeasonHash];

    return {
      seasonPassRewardsPage: Math.ceil((Math.min(characterProgressions[member.characterId].progressions[definitionSeason.seasonPassProgressionHash] && characterProgressions[member.characterId].progressions[definitionSeason.seasonPassProgressionHash].level, 99) + 1) / getSeasonPassItemsPerPage(viewport.width)),
    };
  }

  componentDidUpdate(p, s) {
    const { member, viewport } = this.props;
    const characterProgressions = member.data.profile.characterProgressions.data;

    const definitionSeason = manifest.DestinySeasonDefinition[manifest.settings.destiny2CoreSettings.currentSeasonHash];

    if (s.seasonPassRewardsPage !== this.state.seasonPassRewardsPage) {
      this.props.rebindTooltips();
    }

    if ((p.member.data.profile.characterProgressions.data[p.member.characterId].progressions[definitionSeason.seasonPassProgressionHash] && p.member.data.profile.characterProgressions.data[p.member.characterId].progressions[definitionSeason.seasonPassProgressionHash].level) !== (characterProgressions[this.props.member.characterId].progressions[definitionSeason.seasonPassProgressionHash] && characterProgressions[this.props.member.characterId].progressions[definitionSeason.seasonPassProgressionHash].level)) {
      this.setState((p) => ({
        ...p,
        seasonPassRewardsPage: Math.ceil((characterProgressions[this.props.member.characterId].progressions[definitionSeason.seasonPassProgressionHash].level + 1) / getSeasonPassItemsPerPage(viewport.width)),
      }));
    }

    if (p.viewport.width !== viewport.width) {
      this.setState((p) => ({
        ...p,
        seasonPassRewardsPage: Math.ceil((Math.min(characterProgressions[member.characterId].progressions[definitionSeason.seasonPassProgressionHash].level, 99) + 1) / getSeasonPassItemsPerPage(viewport.width)),
      }));
    }
  }

  handler_seasonPassPrev = (e) => {
    this.setState((p) => ({
      ...p,
      seasonPassRewardsPage: p.seasonPassRewardsPage - 1,
    }));
  };

  handler_seasonPassNext = (e) => {
    this.setState((p) => ({
      ...p,
      seasonPassRewardsPage: p.seasonPassRewardsPage + 1,
    }));
  };

  render() {
    const { t, member, viewport } = this.props;
    const characters = member.data.profile.characters.data;
    const character = characters.find((c) => c.characterId === member.characterId);
    const characterProgressions = member.data.profile.characterProgressions.data;

    const definitionSeason = manifest.DestinySeasonDefinition[manifest.settings.destiny2CoreSettings.currentSeasonHash];

    // just in case
    if (!characterProgressions[member.characterId].progressions[definitionSeason.seasonPassProgressionHash]) {
      return null;
    }

    const seasonPassItemsPerPage = getSeasonPassItemsPerPage(viewport.width);

    const seasonPass = {
      slice: this.state.seasonPassRewardsPage * seasonPassItemsPerPage - seasonPassItemsPerPage,
      itemsPerPage: seasonPassItemsPerPage,
      ranks: manifest.DestinyProgressionDefinition[definitionSeason.seasonPassProgressionHash].steps.map((s, x) => {
        const rank = x + 1;
        const rewards = manifest.DestinyProgressionDefinition[definitionSeason.seasonPassProgressionHash].rewardItems
          .map((r, i) => {
            return {
              ...r,
              state: enums.enumerateProgressionRewardItemState(characterProgressions[member.characterId].progressions[definitionSeason.seasonPassProgressionHash].rewardItemStates[i]),
            };
          })
          .filter((r, i) => r.rewardedAtProgressionLevel === rank);
        const rewardsFree = rewards
          .filter((r) => r.uiDisplayStyle === 'free')
          .filter((i) => {
            const definitionItem = manifest.DestinyInventoryItemDefinition[i.itemHash];

            // if package search contents
            if (definitionItem.itemCategoryHashes.includes(268598612)) {
              if (
                definitionItem.gearset &&
                definitionItem.gearset.itemList &&
                definitionItem.gearset.itemList.filter((t) => {
                  const definitionItem = manifest.DestinyInventoryItemDefinition[t];

                  if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
                    return true;
                  } else {
                    return false;
                  }
                }).length
              ) {
                return false;
              } else {
                return true;
              }
            } else if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
              return false;
            } else {
              return true;
            }
          });

        const rewardsPremium = rewards
          .filter((r) => r.uiDisplayStyle === 'premium')
          .filter((i) => {
            const definitionItem = manifest.DestinyInventoryItemDefinition[i.itemHash];

            // remove extra "Twisted Energy" from season 11 premium pass
            if (definitionItem.hash === 669434421 || definitionItem.hash === 686728455) return false;

            // if package, search contents
            if (definitionItem.itemCategoryHashes.includes(268598612)) {
              if (
                definitionItem.gearset &&
                definitionItem.gearset.itemList &&
                definitionItem.gearset.itemList.filter((t) => {
                  const definitionItem = manifest.DestinyInventoryItemDefinition[t];

                  if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
                    return true;
                  } else {
                    return false;
                  }
                }).length
              ) {
                return false;
              } else {
                return true;
              }
            }
            // if it's not a shader, it might be an armour ornament in which case we only want the one matching our current class
            else if (definitionItem.plug?.plugCategoryIdentifier && definitionItem.plug.plugCategoryIdentifier !== 'shader') {
              const classString = enums.classStrings[character.classType];

              if (definitionItem.plug.plugCategoryIdentifier.indexOf(classString) > -1) {
                return true;
              } else {
                return false;
              }
            } else if (definitionItem.classType > -1 && definitionItem.classType < 3 && definitionItem.classType !== character.classType) {
              return false;
            } else {
              return true;
            }
          });

        return {
          rank,
          free: rewardsFree,
          premium: rewardsPremium,
        };
      }),
    };

    const seasonRank = progressionSeasonRank(member);

    return (
      <div className='wrapper'>
        <div className='module status'>
          <div className='sub-header'>
            <div>{t('Season pass')}</div>
          </div>
          <div className='text'>
            <div className='name'>{definitionSeason.displayProperties.name}</div>
            <div className='description'>
              <p>{definitionSeason.displayProperties.description}</p>
            </div>
          </div>
          <div className='rank'>{seasonRank.level}</div>
        </div>
        <div className='page'>
          <Button text={<i className='segoe-uniE973' />} action={this.handler_seasonPassPrev} disabled={this.state.seasonPassRewardsPage * seasonPassItemsPerPage - seasonPassItemsPerPage < 1} />
        </div>
        <div className='rewards'>
          {[...seasonPass.ranks, { filler: true }, { filler: true }].slice(seasonPass.slice, seasonPass.slice + seasonPass.itemsPerPage).map((r, i) => {
            const progressData = { ...characterProgressions[member.characterId].progressions[definitionSeason.seasonPassProgressionHash] };

            if (r.filler) {
              return (
                <div key={i} className='rank filler'>
                  <div />
                  <div className='free' />
                  <div className='premium' />
                </div>
              );
            }

            if (progressData.level === progressData.levelCap) {
              progressData.nextLevelAt = 1000;
              progressData.progressToNextLevel = 1000;
            } else if (r.rank <= progressData.level) {
              progressData.progressToNextLevel = progressData.nextLevelAt;
            } else if (r.rank > progressData.level + 1) {
              progressData.progressToNextLevel = 0;
            }

            return (
              <div key={r.rank} className='rank' data-rank={r.rank}>
                <ProgressBar hideCheck {...progressData} />
                <div className={cx('free', { earned: r.free.length && r.free[0].state.Earned, claimed: r.free.length && r.free[0].state.Claimed, claimAllowed: r.free.length && r.free[0].state.ClaimAllowed })}>
                  <ul className='list inventory-items'>
                    {r.free.length ? (
                      <Items
                        items={r.free.map((r) => {
                          return {
                            ...r,
                            state: null,
                          };
                        })}
                      />
                    ) : null}
                  </ul>
                </div>
                <div className={cx('premium', { earned: r.premium.length && r.premium[0].state.Earned, claimed: r.premium.length && r.premium[0].state.Claimed, claimAllowed: r.premium.length && r.premium[0].state.ClaimAllowed })}>
                  <ul className='list inventory-items'>
                    {r.premium.length ? (
                      <Items
                        items={r.premium.map((r) => {
                          return {
                            ...r,
                            state: null,
                          };
                        })}
                      />
                    ) : null}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        <div className='page'>
          <Button text={<i className='segoe-uniE974' />} action={this.handler_seasonPassNext} disabled={seasonPass.slice + seasonPass.itemsPerPage >= 100} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    viewport: state.viewport,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rebindTooltips: (value) => {
      dispatch({ type: 'REBIND_TOOLTIPS', payload: new Date().getTime() });
    },
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(SeasonPass);
