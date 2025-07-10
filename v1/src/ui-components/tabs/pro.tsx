/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Container, Heading, Text } from "@medusajs/ui"
import { Grid, Link } from "@mui/material";

const HEIGHT = 330;

const ProTab = () => {
  return (
    <Grid container spacing={2} justifyContent={"center"} >
      <Grid container justifyContent={"center"} marginTop={6}>
        <Grid item>
          <h1>
            Pro
          </h1>
        </Grid>
      </Grid>
      <Grid container justifyContent={"center"} marginTop={1} spacing={5}>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <h1>Customized dashboard</h1>
              </Grid>
              <Grid item>
                <Text>
                  {'With this basic version, you have dashboard which shows basic information about orders, products and customers.'}
                </Text>
              </Grid>
              <Grid item>
                <Text>
                  {'Pro version allows you to customize what is displayed on your dashboard.'}
                </Text>
              </Grid>
              <Grid item>
                <h1>Date range picker</h1>
              </Grid>
              <Grid item>
                <Text>
                  {'With this basic version, you have access to a few pre-defined date ranges. But your business might need custom date ranges.'}
                </Text>
              </Grid>
              <Grid item>
                <Text>
                  {'Pro version allows you to select any custom date range.'}
                </Text>
              </Grid>
              <Grid item>
                <h1>Advanced statistics</h1>
              </Grid>
              <Grid item>
                <Text>
                  {'With this basic version, you have access to basic statistics.'}
                </Text>
              </Grid>
              <Grid item>
                <Text>
                  {'Pro version contains much more detailed analytics. For example, customer statistics shows:'}
                </Text>
                <Text>
                  {'- Repeat customer rate - how many of your customers are coming back to buy again'}
                </Text>
                <Text>
                  {'- Order frequency distribution - how frequently customers are ordering'}
                </Text>
                <Text>
                  {'- Customer retention rate - how many customers bought again in a specific period'}
                </Text>
              </Grid>
              <Grid item>
                <h1>Professional support</h1>
              </Grid>
              <Grid item>
                <Text>
                  {'With this basic version, you can report issues on GitHub.'}
                </Text>
              </Grid>
              <Grid item>
                <Text>
                  {'Pro version gives you access to professional support with guaranteed response time.'}
                </Text>
              </Grid>
              <Grid item paddingTop={10}>
                <Text>
                  {'If you are interested in Pro version, please contact us at '}
                  <Link href="mailto:contact@rsoftcon.com">contact@rsoftcon.com</Link>
                </Text>
              </Grid>
              <Grid item>
                <h1>
                  {'Thank you for using our plugin!'}
                </h1>
              </Grid>
              <Grid item>
                <h1>
                  {'RSC Labs team'}
                </h1>
              </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <h1>Date range picker</h1>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Forget about last week, last month, last year</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Choose whatever date range to see statistics exactly for this range</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Compare to any of date range, e.g. compare Decembers or Black Fridays</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <h1>Advanced statistics</h1>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Over 15 professional statistics</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Check funnels related to carts and checkouts, how they change into purchases</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>See your analytics per sales channel</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Deep insights about discounts, gift cards and how they influence orders</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs={3} md={3} xl={3}>
          <Container style={ { borderColor: 'purple', borderWidth: 1, height: HEIGHT}}>
            <Grid container rowSpacing={3}>
              <Grid item>
                <h1>Professional support</h1>
              </Grid>
              <Grid item>
                <ul style={ { listStyleType: 'circle'}}>
                  <li>
                    <Text>Priority for bugs</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Dedicated channel for your feature requests for evaluation</Text>
                  </li>
                  <li style={ { marginTop: 3}}>
                    <Text>Establish long-term cooperation also for other plugins</Text>
                  </li>
                </ul>
                </Grid>
            </Grid>
          </Container>
        </Grid>
      </Grid>
      <Grid container spacing={3} direction={'column'} alignContent={"center"} marginTop={6}>
        <Grid container direction={'row'} justifyContent={'center'} columnSpacing={1}>
          <Grid item>
            <h1 style={{ color: 'purple' }}>
              Contact:
            </h1>
          </Grid>
          <Grid item>
            <Link href="mailto:labs@rsoftcon.com">
              <h1 style={{ color: 'purple' }}>
                labs@rsoftcon.com
              </h1>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ProTab