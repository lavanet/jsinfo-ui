import React from 'react';

interface StakeData {
  activeStake: string;
  activeStakeRaw: string;
  activeDelegate: string;
  activeDelegateRaw: string;
  activeDelegateAndStakeTotal: string;
  activeDelegateAndStakeTotalRaw: string;
  activeAndInactiveStake: string;
  activeAndInactiveStakeRaw: string;
  activeAndInactiveDelegateStake: string;
  activeAndInactiveDelegateStakeRaw: string;
  activeAndInactiveStakeTotal: string;
  activeAndInactiveStakeTotalRaw: string;
}

const StakeTooltipContent: React.FC<{ data: StakeData }> = ({ data }) => {
  return (
    <div className="stake-tooltip-content" style={{ fontFamily: 'sans-serif', maxWidth: '500px' }}>
      <div style={{
        border: '1px solid #444',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        backgroundColor: '#111111'
      }}>
        {/* Active Services Section */}
        <div>
          <div style={{
            backgroundColor: '#252525',
            padding: '12px',
            borderBottom: '1px solid #444',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#e0e0e0'
          }}>
            Active Services Stake
          </div>

          <div style={{ padding: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{
                    padding: '12px 0',
                    color: '#aaa',
                    fontSize: '13px',
                    paddingRight: '30px'
                  }}>Self-stake:</td>
                  <td style={{
                    padding: '12px 0',
                    textAlign: 'right',
                    paddingLeft: '15px'   // Add left padding to values
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '13px', color: '#e0e0e0' }}>{data.activeStake}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{data.activeStakeRaw} ulava</div>
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '12px 0',
                    color: '#aaa',
                    fontSize: '13px',
                    paddingRight: '30px'
                  }}>Delegations:</td>
                  <td style={{
                    padding: '12px 0',
                    textAlign: 'right',
                    paddingLeft: '15px'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '13px', color: '#e0e0e0' }}>{data.activeDelegate}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{data.activeDelegateRaw} ulava</div>
                  </td>
                </tr>
                <tr style={{ borderTop: '1px solid #333' }}>
                  <td style={{
                    padding: '10px 0',
                    color: '#ddd',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    paddingRight: '30px'
                  }}>Combined Total:</td>
                  <td style={{
                    padding: '10px 0',
                    textAlign: 'right',
                    paddingLeft: '15px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#FF5700' }}>{data.activeDelegateAndStakeTotal}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{data.activeDelegateAndStakeTotalRaw} ulava</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Active & Inactive Services Section */}
        <div>
          <div style={{
            backgroundColor: '#252525',
            padding: '12px',
            borderTop: '1px solid #444',
            borderBottom: '1px solid #444',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#e0e0e0'
          }}>
            Active & Inactive Services Stake
          </div>

          <div style={{ padding: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{
                    padding: '12px 0',
                    color: '#aaa',
                    fontSize: '13px',
                    paddingRight: '30px'
                  }}>Self-stake:</td>
                  <td style={{
                    padding: '12px 0',
                    textAlign: 'right',
                    paddingLeft: '15px'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '13px', color: '#e0e0e0' }}>{data.activeAndInactiveStake}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{data.activeAndInactiveStakeRaw} ulava</div>
                  </td>
                </tr>
                <tr>
                  <td style={{
                    padding: '12px 0',
                    color: '#aaa',
                    fontSize: '13px',
                    paddingRight: '30px'
                  }}>Delegations:</td>
                  <td style={{
                    padding: '12px 0',
                    textAlign: 'right',
                    paddingLeft: '15px'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '13px', color: '#e0e0e0' }}>{data.activeAndInactiveDelegateStake}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{data.activeAndInactiveDelegateStakeRaw} ulava</div>
                  </td>
                </tr>
                <tr style={{ borderTop: '1px solid #333' }}>
                  <td style={{
                    padding: '10px 0',
                    color: '#ddd',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    paddingRight: '30px'
                  }}>Combined Total:</td>
                  <td style={{
                    padding: '10px 0',
                    textAlign: 'right',
                    paddingLeft: '15px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#FF5700' }}>{data.activeAndInactiveStakeTotal}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{data.activeAndInactiveStakeTotalRaw} ulava</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate HTML string from component for tooltip usage
export const getStakeTooltipHtml = (data: StakeData): string => {
  return `
  <div style="font-family: sans-serif; max-width: 500px;">
    <div style="border: 1px solid #444; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.4); background-color: #111111;">
      <!-- Active Services Section -->
      <div>
        <div style="background-color: #252525; padding: 12px; border-bottom: 1px solid #444; font-weight: bold; font-size: 14px; color: #e0e0e0;">
          Active Services Stake
        </div>
        
        <div style="padding: 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 12px 0; color: #aaa; font-size: 13px; padding-right: 30px;">Self-stake:</td>
                <td style="padding: 12px 0; text-align: right; padding-left: 15px;">
                  <div style="font-weight: 500; font-size: 13px; color: #e0e0e0;">${data.activeStake}</div>
                  <div style="color: #888; font-size: 11px;">${data.activeStakeRaw} ulava</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #aaa; font-size: 13px; padding-right: 30px;">Delegations:</td>
                <td style="padding: 12px 0; text-align: right; padding-left: 15px;">
                  <div style="font-weight: 500; font-size: 13px; color: #e0e0e0;">${data.activeDelegate}</div>
                  <div style="color: #888; font-size: 11px;">${data.activeDelegateRaw} ulava</div>
                </td>
              </tr>
              <tr style="border-top: 1px solid #333;">
                <td style="padding: 10px 0; color: #ddd; font-weight: bold; font-size: 13px; padding-right: 30px;">Combined Total:</td>
                <td style="padding: 10px 0; text-align: right; padding-left: 15px;">
                  <div style="font-weight: bold; font-size: 14px; color: #FF5700;">${data.activeDelegateAndStakeTotal}</div>
                  <div style="color: #888; font-size: 11px;">${data.activeDelegateAndStakeTotalRaw} ulava</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Active & Inactive Services Section -->
      <div>
        <div style="background-color: #252525; padding: 12px; border-top: 1px solid #444; border-bottom: 1px solid #444; font-weight: bold; font-size: 14px; color: #e0e0e0;">
          Active & Inactive Services Stake
        </div>
        
        <div style="padding: 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 12px 0; color: #aaa; font-size: 13px; padding-right: 30px;">Self-stake:</td>
                <td style="padding: 12px 0; text-align: right; padding-left: 15px;">
                  <div style="font-weight: 500; font-size: 13px; color: #e0e0e0;">${data.activeAndInactiveStake}</div>
                  <div style="color: #888; font-size: 11px;">${data.activeAndInactiveStakeRaw} ulava</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #aaa; font-size: 13px; padding-right: 30px;">Delegations:</td>
                <td style="padding: 12px 0; text-align: right; padding-left: 15px;">
                  <div style="font-weight: 500; font-size: 13px; color: #e0e0e0;">${data.activeAndInactiveDelegateStake}</div>
                  <div style="color: #888; font-size: 11px;">${data.activeAndInactiveDelegateStakeRaw} ulava</div>
                </td>
              </tr>
              <tr style="border-top: 1px solid #333;">
                <td style="padding: 10px 0; color: #ddd; font-weight: bold; font-size: 13px; padding-right: 30px;">Combined Total:</td>
                <td style="padding: 10px 0; text-align: right; padding-left: 15px;">
                  <div style="font-weight: bold; font-size: 14px; color: #FF5700;">${data.activeAndInactiveStakeTotal}</div>
                  <div style="color: #888; font-size: 11px;">${data.activeAndInactiveStakeTotalRaw} ulava</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `;
};

export default StakeTooltipContent; 